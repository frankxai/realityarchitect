import assert from 'node:assert/strict'
import test from 'node:test'
import zlib from 'node:zlib'
import { createZip, crc32 } from '../lib/studio/zip.ts'

const encode = (text) => new TextEncoder().encode(text)
const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

test('crc32 matches the zlib reference', () => {
  for (const sample of ['', 'a', 'Reality Architect — Imagine it. Build it. Witness it. ✨']) {
    assert.equal(crc32(encode(sample)), zlib.crc32(encode(sample)) >>> 0, JSON.stringify(sample))
  }
})

test('an archive has local headers, a central directory and an end record', () => {
  const files = [
    { path: 'Reality Architect/reality.md', data: encode('# reality.md\n') },
    { path: 'Reality Architect/reality/ü.md', data: encode('über\n') },
  ]
  const zip = createZip(files, new Date(2026, 9, 4, 12, 30, 10))
  const dv = view(zip)
  assert.equal(dv.getUint32(0, true), 0x04034b50)
  const end = zip.length - 22
  assert.equal(dv.getUint32(end, true), 0x06054b50)
  assert.equal(dv.getUint16(end + 10, true), 2, 'two entries')
  const centralSize = dv.getUint32(end + 12, true)
  const centralOffset = dv.getUint32(end + 16, true)
  assert.equal(centralOffset + centralSize, end)

  let offset = centralOffset
  for (const file of files) {
    assert.equal(dv.getUint32(offset, true), 0x02014b50)
    assert.equal(dv.getUint16(offset + 8, true) & 0x0800, 0x0800, 'UTF-8 names flag')
    assert.equal(dv.getUint16(offset + 10, true), 0, 'stored, not compressed')
    assert.equal(dv.getUint32(offset + 16, true), crc32(file.data))
    const nameLength = dv.getUint16(offset + 28, true)
    const name = new TextDecoder().decode(zip.subarray(offset + 46, offset + 46 + nameLength))
    assert.equal(name, file.path)
    const local = dv.getUint32(offset + 42, true)
    assert.equal(dv.getUint32(local, true), 0x04034b50)
    const localName = dv.getUint16(local + 26, true)
    const start = local + 30 + localName
    assert.deepEqual(zip.subarray(start, start + file.data.length), file.data)
    offset += 46 + nameLength
  }
})

test('dates are stored in DOS format', () => {
  const zip = createZip([{ path: 'a.txt', data: encode('a') }], new Date(2026, 9, 4, 12, 30, 10))
  const dv = view(zip)
  assert.equal(dv.getUint16(10, true), (12 << 11) | (30 << 5) | 5)
  assert.equal(dv.getUint16(12, true), ((2026 - 1980) << 9) | (10 << 5) | 4)
})

test('an empty archive is a valid 22-byte end record', () => {
  const zip = createZip([])
  assert.equal(zip.length, 22)
  assert.equal(view(zip).getUint32(0, true), 0x06054b50)
})
