/**
 * A minimal ZIP writer (store method, no compression) so the Studio can hand over an Obsidian-ready folder without a
 * dependency. Text exports are small; images are already compressed. Names are UTF-8 (general-purpose flag bit 11).
 */

const TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function dosTime(date: Date) {
  const year = Math.min(2107, Math.max(1980, date.getFullYear()))
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

export interface ZipEntry {
  path: string
  data: Uint8Array
}

export function createZip(files: ZipEntry[], date: Date = new Date()): Uint8Array {
  const encoder = new TextEncoder()
  const stamp = dosTime(date)
  const prepared = files.map((file) => ({ name: encoder.encode(file.path), data: file.data, crc: crc32(file.data) }))
  const localSize = prepared.reduce((sum, file) => sum + 30 + file.name.length + file.data.length, 0)
  const centralSize = prepared.reduce((sum, file) => sum + 46 + file.name.length, 0)
  const out = new Uint8Array(localSize + centralSize + 22)
  const dv = new DataView(out.buffer)
  let offset = 0
  const offsets: number[] = []

  for (const file of prepared) {
    offsets.push(offset)
    dv.setUint32(offset, 0x04034b50, true)
    dv.setUint16(offset + 4, 20, true)
    dv.setUint16(offset + 6, 0x0800, true)
    dv.setUint16(offset + 8, 0, true)
    dv.setUint16(offset + 10, stamp.time, true)
    dv.setUint16(offset + 12, stamp.date, true)
    dv.setUint32(offset + 14, file.crc, true)
    dv.setUint32(offset + 18, file.data.length, true)
    dv.setUint32(offset + 22, file.data.length, true)
    dv.setUint16(offset + 26, file.name.length, true)
    dv.setUint16(offset + 28, 0, true)
    out.set(file.name, offset + 30)
    out.set(file.data, offset + 30 + file.name.length)
    offset += 30 + file.name.length + file.data.length
  }

  const centralStart = offset
  prepared.forEach((file, index) => {
    dv.setUint32(offset, 0x02014b50, true)
    dv.setUint16(offset + 4, 20, true)
    dv.setUint16(offset + 6, 20, true)
    dv.setUint16(offset + 8, 0x0800, true)
    dv.setUint16(offset + 10, 0, true)
    dv.setUint16(offset + 12, stamp.time, true)
    dv.setUint16(offset + 14, stamp.date, true)
    dv.setUint32(offset + 16, file.crc, true)
    dv.setUint32(offset + 20, file.data.length, true)
    dv.setUint32(offset + 24, file.data.length, true)
    dv.setUint16(offset + 28, file.name.length, true)
    dv.setUint16(offset + 30, 0, true)
    dv.setUint16(offset + 32, 0, true)
    dv.setUint16(offset + 34, 0, true)
    dv.setUint16(offset + 36, 0, true)
    dv.setUint32(offset + 38, 0, true)
    dv.setUint32(offset + 42, offsets[index], true)
    out.set(file.name, offset + 46)
    offset += 46 + file.name.length
  })

  dv.setUint32(offset, 0x06054b50, true)
  dv.setUint16(offset + 4, 0, true)
  dv.setUint16(offset + 6, 0, true)
  dv.setUint16(offset + 8, prepared.length, true)
  dv.setUint16(offset + 10, prepared.length, true)
  dv.setUint32(offset + 12, offset - centralStart, true)
  dv.setUint32(offset + 16, centralStart, true)
  dv.setUint16(offset + 20, 0, true)
  return out
}
