'use client'

import { useEffect, useRef, useState } from 'react'
import { layoutMap, toJsonCanvas } from '@/lib/studio/canvas'
import { ROOT, bundleFiles, realityMd, soulMd, weeklyPrompt } from '@/lib/studio/export'
import { clearImages, getImage, imageExtension } from '@/lib/studio/images'
import { parseImport } from '@/lib/studio/importer'
import type { ProgramDay } from '@/lib/studio/program'
import { sampleState } from '@/lib/studio/sample'
import { emptyState, isEmptyState } from '@/lib/studio/state'
import type { StudioState } from '@/lib/studio/types'
import { createZip } from '@/lib/studio/zip'
import { ConfirmButton, button, copyText, downloadBlob, downloadText } from './ui'
import type { StudioApi } from './useStudio'
import type { Go } from './views'

const SAVE_TEXT = {
  idle: 'Saved on this device.',
  saved: 'Saved on this device.',
  unavailable: 'This browser is not keeping Studio data (private window or blocked site data). Export before you leave.',
  quota: 'This browser’s storage for the Studio is full. Export a backup, then remove some images from the map.',
  error: 'The last change could not be saved on this device. Export a backup to keep it.',
  conflict: 'Another tab saved a different copy of your Studio. Choose which to keep in the notice above the views.',
} as const

export function DataDialog({ studio, open, onClose, go, programDays = [] }: { studio: StudioApi; open: boolean; onClose: () => void; go: Go; programDays?: ProgramDay[] }) {
  const { state, today, replace, update, announce, saveStatus, forget } = studio
  const dialog = useRef<HTMLDialogElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<StudioState | null>(null)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  const exportAll = async () => {
    setBusy(true)
    try {
      const encoder = new TextEncoder()
      const files = bundleFiles(state, today, programDays).map((file) => ({ path: file.path, data: encoder.encode(file.text) }))
      const types: Record<string, string> = {}
      for (const card of state.canvas.cards) {
        if (!card.imageId) continue
        const image = await getImage(card.imageId)
        if (!image) continue
        types[card.imageId] = image.blob.type
        files.push({ path: `${ROOT}reality/images/${card.imageId}.${imageExtension(image.blob.type)}`, data: new Uint8Array(await image.blob.arrayBuffer()) })
      }
      // Paths from the vault root, with the export folder at its top level; images that were not exported are skipped.
      const canvas = toJsonCanvas(layoutMap(state, today), (imageId) => (types[imageId] ? `${ROOT}reality/images/${imageId}.${imageExtension(types[imageId])}` : null))
      files.push({ path: `${ROOT}Reality Map.canvas`, data: encoder.encode(`${JSON.stringify(canvas, null, 2)}\n`) })
      const zip = createZip(files)
      downloadBlob(`reality-architect-${today}.zip`, new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }))
      announce(`Export requested: ${files.length} files in one folder, ready for your notes vault.`)
    } finally {
      setBusy(false)
    }
  }

  const readImport = async (file: File | undefined) => {
    setError('')
    setPending(null)
    if (!file) return
    const result = parseImport(await file.text(), today)
    if (result.kind === 'error') {
      setError(result.message)
      announce(result.message)
    } else if (result.kind === 'card') {
      update((draft) => { draft.bridges.push(result.bridge) })
      announce('Your Reality Card is now a bridge.')
      onClose()
      go('bridges', result.bridge.id)
    } else if (isEmptyState(state)) {
      replace(result.state)
      announce('Backup imported.')
      onClose()
    } else {
      setPending(result.state)
    }
  }

  const deleteEverything = async () => {
    setDeleteError('')
    const text = forget()
    const images = await clearImages()
    if (text && images) {
      announce('Everything in this Studio was deleted from this device.')
      onClose()
      return
    }
    // Never claim a deletion the browser did not confirm; keep the dialog open with the honest state.
    const left = !text && !images ? 'your saved text and images' : !text ? 'your saved text' : 'your images'
    const message = `The Studio is empty on screen, but this browser did not confirm deleting ${left}. To be sure, clear this site’s data in your browser settings.`
    setDeleteError(message)
    announce(message)
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="data-title"
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-0 text-ink backdrop:bg-black/70"
    >
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="data-title" className="text-xl font-bold text-ink">Your data</h2>
            <p className="mt-1 text-sm text-muted">{SAVE_TEXT[saveStatus]} Nothing is sent anywhere. You decide where copies go.</p>
          </div>
          <button type="button" className={button.ghost} onClick={onClose}>Close</button>
        </div>

        <section className="mt-6" aria-labelledby="data-export">
          <h3 id="data-export" className="text-sm font-semibold text-ink">Export</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">One folder with reality.md, soul.md, your reality/ state, images, and a Reality Map that opens in Obsidian, including on your phone.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={button.primary} disabled={busy} onClick={() => void exportAll()}>{busy ? 'Preparing…' : 'Export everything (.zip)'}</button>
            <button type="button" className={button.secondary} onClick={() => { downloadText(`reality-studio-backup-${today}.json`, `${JSON.stringify(state, null, 2)}\n`, 'application/json;charset=utf-8'); announce('Backup download requested. Images are not inside the backup.') }}>Backup (.json)</button>
            <button type="button" className={button.secondary} onClick={() => { downloadText('reality.md', realityMd(state, today)); announce('reality.md download requested.') }}>reality.md</button>
            <button type="button" className={button.secondary} onClick={() => { downloadText('soul.md', soulMd(state, today)); announce('soul.md download requested.') }}>soul.md</button>
          </div>
        </section>

        <section className="mt-6" aria-labelledby="data-ai">
          <h3 id="data-ai" className="text-sm font-semibold text-ink">Use it with your own AI</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">Copies a weekly-review prompt with your soul.md, reality.md, pace, and the last seven days, to paste into the assistant you already use. It carries the Agent Charter’s rules. Paste it only where you are comfortable sharing it.</p>
          <button type="button" className={`${button.secondary} mt-3`} onClick={async () => announce((await copyText(weeklyPrompt(state, today))) ? 'Weekly review prompt copied.' : 'Copy was blocked by the browser.')}>Copy weekly review prompt</button>
        </section>

        <section className="mt-6" aria-labelledby="data-import">
          <h3 id="data-import" className="text-sm font-semibold text-ink">Import</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">A Studio backup (.json), or a Reality Card exported from the Imaginal Act, which becomes a new bridge.</p>
          <input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => { void readImport(event.target.files?.[0]); event.target.value = '' }} />
          <button type="button" className={`${button.secondary} mt-3`} onClick={() => fileInput.current?.click()}>Choose a file</button>
          {error && <p className="mt-2 text-sm text-[#ffb4b4]">{error}</p>}
          {pending && (
            <div className="mt-3 rounded-lg border border-dawn/30 p-3">
              <p className="text-sm text-ink">This replaces everything currently in your Studio with the backup.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <ConfirmButton label="Replace with backup" confirmLabel="Confirm: replace everything" onConfirm={() => { replace(pending); setPending(null); announce('Backup imported.'); onClose() }} />
                <button type="button" className={button.ghost} onClick={() => setPending(null)}>Keep my current Studio</button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-6" aria-labelledby="data-sample">
          <h3 id="data-sample" className="text-sm font-semibold text-ink">The sample life</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">Mara, a fictional composer, so you can see every view filled before you start your own.</p>
          <div className="mt-3">
            {state.sample ? (
              <ConfirmButton label="Clear the sample and start mine" confirmLabel="Confirm: clear the sample, including anything added to it" className={button.secondary} onConfirm={() => { replace(emptyState()); announce('Sample cleared. The Studio is yours.'); onClose() }} />
            ) : isEmptyState(state) ? (
              <button type="button" className={button.secondary} onClick={() => { replace(sampleState(today)); announce('Sample life loaded. It is fictional.'); onClose() }}>Explore the sample life</button>
            ) : (
              <ConfirmButton label="Load the sample (replaces your Studio)" confirmLabel="Confirm: replace with the sample" className={button.secondary} onConfirm={() => { replace(sampleState(today)); announce('Sample life loaded. It is fictional.'); onClose() }} />
            )}
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-6" aria-labelledby="data-delete">
          <h3 id="data-delete" className="text-sm font-semibold text-ink">Delete everything</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">Removes every entry and image from this browser on this device. Export first if you want to keep anything.</p>
          <div className="mt-3"><ConfirmButton label="Delete everything" confirmLabel="Confirm: delete everything" onConfirm={() => void deleteEverything()} /></div>
          {deleteError && <p className="mt-2 text-sm text-[#ffb4b4]">{deleteError}</p>}
        </section>
      </div>
    </dialog>
  )
}
