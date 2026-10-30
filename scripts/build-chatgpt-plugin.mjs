#!/usr/bin/env node

// Package the existing Reality Architect skills for a cloud conversation host.
// Local stdio MCP configuration stays in the repository; it is never an account binding.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { checkSkill, libraryTeacherNames } from '../plugins/reality-architect/engine/skill-check.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const plugin = path.join(root, 'plugins/reality-architect')
const roots = ['plugin.json', 'README.md', 'LICENSE', 'CHARTER.md', 'STATE.md', 'HOST.md', 'assets', 'skills', 'bin', 'engine']

export function packageFiles(source = plugin) {
  const files = []
  function visit(relative) {
    if (relative.split('/').some((part) => !part || part === '..' || part.startsWith('.'))) throw new Error(`Unsafe package path: ${relative}`)
    const absolute = path.join(source, relative)
    const stat = fs.lstatSync(absolute)
    if (stat.isSymbolicLink()) throw new Error(`Symlinks are not allowed: ${relative}`)
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) visit(`${relative}/${name}`)
    } else if (stat.isFile()) {
      files.push({ path: relative, bytes: fs.readFileSync(absolute) })
    } else throw new Error(`Unsupported package entry: ${relative}`)
  }
  for (const entry of roots) visit(entry)
  return files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
}

export function validatePackage(source = plugin, files = packageFiles(source)) {
  const manifest = JSON.parse(files.find((f) => f.path === 'plugin.json').bytes.toString('utf8'))
  const legacy = JSON.parse(fs.readFileSync(path.join(source, '.claude-plugin/plugin.json'), 'utf8'))
  if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') throw new Error('Portable schema is required')
  if (manifest.name !== legacy.name || manifest.version !== legacy.version) throw new Error('Portable and local identities must agree')
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('A strict release version is required')
  if (manifest.name !== 'reality-architect') throw new Error('Preserve the existing plugin identity')
  const ui = manifest.extensions?.['com.openai']?.interface
  if (!ui || ui.shortDescription.length > 30 || !ui.shortDescription.trim()) throw new Error('Subtitle must contain 1–30 characters')
  if (ui.category !== 'Productivity' || !Array.isArray(ui.capabilities)) throw new Error('Invalid interface metadata')
  if (!Array.isArray(ui.defaultPrompt) || ui.defaultPrompt.length < 1 || ui.defaultPrompt.length > 3 || ui.defaultPrompt.some((p) => !p.trim() || p.length > 128 || /\r|\n/.test(p))) throw new Error('Invalid default prompts')
  for (const key of ['logo', 'composerIcon']) {
    const asset = ui[key].replace(/^\.\//, '')
    if (asset.includes('..') || !files.some((f) => f.path === asset && f.bytes.length <= 5 * 1024 * 1024)) throw new Error(`Missing or invalid ${key}`)
  }
  if (manifest.extensions?.['com.openai']?.apps || ['apps', 'skills', 'mcpServers', 'interface'].some((key) => Object.hasOwn(manifest, key))) throw new Error('The account package must not declare local bindings')
  if (files.some((f) => /(^|\/)(?:\.mcp\.json|mcp\.json|\.app\.json|node_modules|\.env)(?:\/|$)/.test(f.path))) throw new Error('The account archive must remain a skills package')
  const skills = files.filter((f) => /^skills\/[^/]+\/SKILL\.md$/.test(f.path))
  if (!skills.length) throw new Error('At least one valid skill is required')
  const names = libraryTeacherNames(source)
  for (const file of skills) {
    const failures = checkSkill(path.join(source, path.dirname(file.path)), { teacherNames: names }).filter((item) => item.level === 'error')
    if (failures.length) throw new Error(`${file.path}: ${failures.map((item) => item.message).join('; ')}`)
    if (!file.bytes.toString('utf8').includes('HOST.md')) throw new Error(`${file.path}: missing host capability boundary`)
  }
  return { manifest, skills: skills.map((f) => f.path.split('/')[1]) }
}

function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

// A ZIP with stored entries, UTF-8 paths and a fixed 1980-01-01 timestamp.
// No dependencies, platform metadata, current timestamps, or executable flags.
export function zipBytes(files) {
  const chunks = [], directory = []
  let offset = 0
  for (const file of files) {
    const name = Buffer.from(file.path, 'utf8'), body = file.bytes, crc = crc32(body)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(33, 12); local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(body.length, 18); local.writeUInt32LE(body.length, 22); local.writeUInt16LE(name.length, 26)
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(33, 14); central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(body.length, 20); central.writeUInt32LE(body.length, 24); central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(offset, 42)
    chunks.push(local, name, body); directory.push(central, name)
    offset += local.length + name.length + body.length
  }
  const centralBytes = Buffer.concat(directory), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralBytes.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, centralBytes, end])
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = path.resolve(process.argv[2] || '/tmp/reality-architect-0.5.0.zip')
  if (output === plugin || output.startsWith(`${plugin}${path.sep}`)) throw new Error('Write the ZIP outside the plugin source')
  const files = packageFiles(), { manifest, skills } = validatePackage(plugin, files), archive = zipBytes(files)
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, archive)
  console.log(JSON.stringify({ output, name: manifest.name, version: manifest.version, files: files.length, skills, mcpServers: 0, bytes: archive.length, sha256: createHash('sha256').update(archive).digest('hex') }, null, 2))
}
