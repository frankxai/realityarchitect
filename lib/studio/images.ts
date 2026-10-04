import { newId } from './util.ts'

/**
 * The only file in the Studio that touches indexedDB: vision-board images the person adds, stored as blobs on this
 * device. They are never uploaded. Every call resolves (never rejects) so a blocked database cannot break the page.
 */

const DB = 'ra-studio'
const STORE = 'images'
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024

interface ImageRecord {
  id: string
  blob: Blob
  name: string
  addedAt: string
}

export function imagesAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
  } catch {
    return false
  }
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!imagesAvailable()) return resolve(null)
    try {
      const request = window.indexedDB.open(DB, 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest | null, fallback: T): Promise<T> {
  const db = await open()
  if (!db) return fallback
  return new Promise<T>((resolve) => {
    try {
      const transaction = db.transaction(STORE, mode)
      const request = work(transaction.objectStore(STORE))
      let value = fallback
      if (request) request.onsuccess = () => { value = (request.result as T | undefined) ?? fallback }
      transaction.oncomplete = () => { db.close(); resolve(value) }
      transaction.onerror = () => { db.close(); resolve(fallback) }
      transaction.onabort = () => { db.close(); resolve(fallback) }
    } catch {
      db.close()
      resolve(fallback)
    }
  })
}

/** Stores an image and returns its id, or null when it is not an image, too large, or storage refused it. */
export async function putImage(blob: Blob, name = 'image'): Promise<string | null> {
  if (!blob.type.startsWith('image/') || blob.size > MAX_IMAGE_BYTES) return null
  const record: ImageRecord = { id: newId(), blob, name: name.slice(0, 120), addedAt: new Date().toISOString() }
  const stored = await run<IDBValidKey | null>('readwrite', (store) => store.put(record), null)
  return stored === null ? null : record.id
}

export async function getImage(id: string): Promise<{ blob: Blob; name: string } | null> {
  const record = await run<ImageRecord | null>('readonly', (store) => store.get(id), null)
  return record ? { blob: record.blob, name: record.name } : null
}

export async function listImageIds(): Promise<string[]> {
  const keys = await run<IDBValidKey[]>('readonly', (store) => store.getAllKeys(), [])
  return keys.map(String)
}

export async function deleteImage(id: string): Promise<void> {
  await run('readwrite', (store) => store.delete(id), undefined)
}

/**
 * Deletes stored images that no card references any more. Images added in the last ten minutes are kept, because
 * another open tab may hold a card for one that it has not saved yet. Returns how many were deleted.
 */
export async function pruneImages(keep: Set<string>, now = Date.now(), graceMs = 10 * 60_000): Promise<number> {
  const records = await run<ImageRecord[]>('readonly', (store) => store.getAll(), [])
  const stale = records.filter((record) => !keep.has(record.id) && now - Date.parse(record.addedAt) > graceMs).map((record) => record.id)
  if (!stale.length) return 0
  await run('readwrite', (store) => {
    for (const id of stale) store.delete(id)
    return null
  }, undefined)
  return stale.length
}

/** Deletes every stored image. True once the browser confirms it (or when this browser could never store any). */
export async function clearImages(): Promise<boolean> {
  if (!imagesAvailable()) return true
  const db = await open()
  if (!db) return false
  return new Promise<boolean>((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).clear()
      transaction.oncomplete = () => { db.close(); resolve(true) }
      transaction.onerror = () => { db.close(); resolve(false) }
      transaction.onabort = () => { db.close(); resolve(false) }
    } catch {
      db.close()
      resolve(false)
    }
  })
}

/** File extension for an image MIME type, for exported file names. */
export function imageExtension(type: string): string {
  const map: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' }
  return map[type] ?? 'img'
}
