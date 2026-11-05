import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { packageFiles, validatePackage, zipBytes } from '../scripts/build-chatgpt-plugin.mjs'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const source = path.join(root, 'plugins/reality-architect')

test('the ChatGPT archive contains usable host-aware skills and no local MCP registration', () => {
  const files = packageFiles(source)
  const { skills, manifest } = validatePackage(source, files)
  assert.ok(skills.includes('reality-first-session'))
  assert.ok(skills.includes('reality-witness'))
  assert.ok(skills.includes('reality-loop'))
  assert.equal(manifest.extensions['com.openai'].interface.category, 'Productivity')
  assert.ok(!files.some((file) => /(?:^|\/)(?:mcp\.json|\.mcp\.json|\.app\.json)$/.test(file.path)))
  assert.ok(!files.some((file) => file.path.startsWith('.claude-plugin/')))
  assert.ok(files.some((file) => file.path === 'HOST.md'))
  assert.ok(files.some((file) => file.path === 'skills/reality-first-session/references/first-session-template.md'))
})

test('the same source produces identical archive bytes regardless of source modification time', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'reality-package-clock-'))
  try {
    fs.cpSync(source, temporary, { recursive: true })
    const before = zipBytes(packageFiles(temporary))
    fs.utimesSync(path.join(temporary, 'plugin.json'), new Date('2001-02-03T00:00:00Z'), new Date('2031-04-05T00:00:00Z'))
    assert.deepEqual(zipBytes(packageFiles(temporary)), before)
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})

test('packaging refuses symlinks instead of exporting files outside the plugin', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'reality-package-test-'))
  try {
    fs.symlinkSync(path.join(source, 'plugin.json'), path.join(temporary, 'plugin.json'))
    assert.throws(() => packageFiles(temporary), /Symlinks are not allowed/)
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
})
