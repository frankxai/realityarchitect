import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The npm packages published from packages/. Each expected file list is exactly what `npm pack` put in the
// 0.1.0 tarballs on the registry (checked 2026-11-27), so a stray test, fixture or secret cannot ride along
// and a dropped entry point fails here before .github/workflows/npm-release.yml ever packs it.
const PACKAGES = {
  'reality-md': {
    name: '@reality-architect/reality-md',
    files: [
      'CONFORMANCE.md',
      'README.md',
      'VERSIONING.md',
      'bin/reality-md.mjs',
      'fixtures/emitted-by-starlight-you.reality.md',
      'fixtures/invalid-missing-sections.reality.md',
      'fixtures/invalid-no-frontmatter.reality.md',
      'fixtures/invalid-unfalsifiable-aims.reality.md',
      'fixtures/sophisticated-operator.reality.md',
      'fixtures/v0.0-legacy.reality.md',
      'fixtures/valid.reality.md',
      'package.json',
      'spec/reality.packet.schema.json',
      'src/emit.mjs',
      'src/graph.mjs',
      'src/index.d.mts',
      'src/index.mjs',
      'src/migrate.mjs',
      'src/parse.mjs',
      'src/validate.mjs',
    ],
  },
  cli: {
    name: '@reality-architect/cli',
    files: [
      'LICENSE',
      'README.md',
      'bin/reality-architect.mjs',
      'package.json',
      'src/index.d.ts',
      'src/index.mjs',
      'src/mcp-server.mjs',
    ],
  },
}

const dirOf = (pkg) => fileURLToPath(new URL(`../packages/${pkg}/`, import.meta.url))
const manifest = (pkg) => JSON.parse(readFileSync(new URL(`../packages/${pkg}/package.json`, import.meta.url), 'utf8'))

function packDryRun(pkg) {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: dirOf(pkg),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const receipts = JSON.parse(out)
  assert.equal(receipts.length, 1, `${pkg}: npm pack produced one receipt`)
  return receipts[0]
}

for (const [pkg, expected] of Object.entries(PACKAGES)) {
  test(`${expected.name}: manifest carries the publish metadata`, () => {
    const m = manifest(pkg)
    assert.equal(m.name, expected.name)
    assert.equal(m.version, '0.1.0')
    assert.equal(m.license, 'MIT')
    assert.equal(m.private, undefined, 'a published package must not be private')
    assert.deepEqual(m.repository, {
      type: 'git',
      url: 'git+https://github.com/frankxai/realityarchitect.git',
      directory: `packages/${pkg}`,
    })
    assert.deepEqual(m.publishConfig, { access: 'public' })
    assert.ok(Array.isArray(m.files) && m.files.length > 0, 'files allowlist is declared')
    for (const target of Object.values(m.bin ?? {})) assert.ok(expected.files.includes(target), `bin ${target} ships`)
  })

  test(`${expected.name}: npm pack --dry-run lists exactly the expected files`, () => {
    const receipt = packDryRun(pkg)
    assert.equal(receipt.name, expected.name)
    assert.equal(receipt.version, '0.1.0')
    assert.deepEqual(receipt.files.map((f) => f.path).sort(), [...expected.files].sort())
    assert.match(receipt.integrity, /^sha512-/)
  })
}

test('every packages/* directory is covered by this contract', () => {
  const root = new URL('../packages/', import.meta.url)
  const dirs = readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/package.json`, root)))
    .map((d) => d.name)
    .sort()
  assert.deepEqual(dirs, Object.keys(PACKAGES).sort())
})
