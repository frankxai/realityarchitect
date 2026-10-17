import { LuaFactory } from 'wasmoon'

/**
 * A stand-in for the Upstash REST endpoint that runs the production Lua text in a real Lua VM.
 *
 * What it keeps from Redis, because the scripts depend on it:
 * - one command at a time, and an EVAL runs to completion before the next command;
 * - a failing `redis.call` raises inside the script and writes made before it stay: no rollback;
 * - WRONGTYPE on a key holding the other type; INCR refuses a non-integer string;
 * - nil replies arrive in Lua as `false`, status replies as `{ok = ...}`, ARGV as strings;
 * - scripts may not create globals.
 *
 * `cjson` is bridged to JSON.parse / JSON.stringify with Redis cjson's one visible difference
 * kept: `/` is escaped as `\/` on encode. Lua is 5.4 here and 5.1 in Redis; the scripts use only
 * what both share.
 */
const factory = new LuaFactory()

export async function luaKv({ failOn, now = () => 0 } = {}) {
  const lua = await factory.createEngine({ injectObjects: false, enableProxy: false })
  /** @type {Map<string, { type: 'string' | 'hash', value: any, expireAt?: number }>} */
  const data = new Map()
  const calls = []
  const inner = []

  const live = (k) => {
    const e = data.get(k)
    if (e && e.expireAt !== undefined && e.expireAt <= now()) {
      data.delete(k)
      return undefined
    }
    return e
  }
  const typed = (k, type) => {
    const e = live(k)
    if (e && e.type !== type) throw new Error('WRONGTYPE Operation against a key holding the wrong kind of value')
    return e
  }
  const commands = {
    type: (k) => ({ ok: live(k)?.type ?? 'none' }),
    get: (k) => typed(k, 'string')?.value ?? null,
    hget: (k, f) => typed(k, 'hash')?.value.get(String(f)) ?? null,
    hset: (k, f, v) => {
      const e = typed(k, 'hash') ?? data.set(k, { type: 'hash', value: new Map() }).get(k)
      const added = e.value.has(String(f)) ? 0 : 1
      e.value.set(String(f), String(v))
      return added
    },
    incr: (k) => {
      const e = typed(k, 'string')
      if (e && !/^-?\d+$/.test(e.value)) throw new Error('ERR value is not an integer or out of range')
      const n = Number(e?.value ?? 0) + 1
      if (e) e.value = String(n)
      else data.set(k, { type: 'string', value: String(n) })
      return n
    },
    pttl: (k) => {
      const e = live(k)
      if (!e) return -2
      return e.expireAt === undefined ? -1 : e.expireAt - now()
    },
    pexpire: (k, ms) => {
      const e = live(k)
      if (!e) return 0
      e.expireAt = now() + Number(ms)
      return 1
    },
  }
  const run = (name, args) => {
    const fn = commands[String(name).toLowerCase()]
    if (!fn) throw new Error(`ERR unknown command '${name}'`)
    return fn(...args)
  }

  lua.global.set('redis', {
    call: (name, ...args) => {
      inner.push(String(name).toLowerCase())
      const reply = run(name, args)
      return reply === null ? false : reply
    },
  })
  lua.global.set('cjson', {
    decode: (s) => {
      if (typeof s !== 'string') throw new Error('bad argument #1 to decode (string expected)')
      return JSON.parse(s)
    },
    encode: (t) => JSON.stringify(t).replace(/\//g, '\\/'),
  })
  lua.global.set('KEYS', [])
  lua.global.set('ARGV', [])
  await lua.doString(`setmetatable(_G, {
    __newindex = function(_, k) error('Script attempted to create global variable ' .. tostring(k)) end,
    __index = function(_, k) error('Script attempted to access nonexistent global variable ' .. tostring(k)) end,
  })`)

  const toReply = (v) => (v === false || v === undefined ? null : Array.isArray(v) ? v.map(toReply) : v)

  let queue = Promise.resolve()
  const perform = async (command) => {
    calls.push(command[0])
    if (failOn && failOn(command)) throw new Error('KV 500')
    const [op, ...a] = command
    if (op !== 'eval') return run(op, a)
    const [script, n, ...rest] = a
    lua.global.set('KEYS', rest.slice(0, n).map(String))
    lua.global.set('ARGV', rest.slice(n).map(String))
    return toReply(await lua.doString(script))
  }
  const kv = (command) => {
    const result = queue.then(() => perform(command))
    queue = result.catch(() => {})
    return result
  }

  const hash = (k) => data.get(k)?.value ?? new Map()
  return { kv, data, calls, inner, hash, str: (k) => data.get(k)?.value, close: () => lua.global.close() }
}
