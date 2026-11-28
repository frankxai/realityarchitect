// Test-only resolve hook: maps @reality-architect/reality-md to the sibling workspace package so the cli
// tests exercise the in-repo source without an install step. Not published (outside the files allowlist).
const local = new Map([
  ['@reality-architect/reality-md', new URL('../../reality-md/src/index.mjs', import.meta.url).href],
])

export async function resolve(specifier, context, nextResolve) {
  const url = local.get(specifier)
  if (url) return { url, shortCircuit: true }
  return nextResolve(specifier, context)
}
