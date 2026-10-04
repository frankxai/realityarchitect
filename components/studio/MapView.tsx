'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { layoutMap, toJsonCanvas, type MapNode, type MapTone } from '@/lib/studio/canvas'
import { ROOT } from '@/lib/studio/export'
import { getImage, imageExtension, putImage } from '@/lib/studio/images'
import { newId } from '@/lib/studio/util'
import { Empty, button, downloadText } from './ui'
import type { StudioApi } from './useStudio'
import type { Go } from './views'

type Camera = { x: number; y: number; zoom: number }
type Gesture =
  | { kind: 'pan'; startX: number; startY: number; camera: Camera }
  | { kind: 'node'; id: string; pointerId: number; startX: number; startY: number; origin: { x: number; y: number }; moved: boolean; x: number; y: number }
  | { kind: 'pinch'; distance: number; camera: Camera; midX: number; midY: number }

const MIN_ZOOM = 0.2
const MAX_ZOOM = 2.5
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const TONE: Record<MapTone, { box: string; title: string; body: string }> = {
  now: { box: 'border-border bg-surface', title: 'text-muted', body: 'text-ink' },
  bridge: { box: 'border-accent/60 bg-[#101a33]', title: 'text-accent', body: 'text-ink' },
  rep: { box: 'border-border bg-bg', title: 'text-accent', body: 'text-ink' },
  move: { box: 'border-border bg-bg', title: 'text-accent', body: 'text-ink' },
  reach: { box: 'border-border bg-bg', title: 'text-accent', body: 'text-ink' },
  witness: { box: 'border-accent-2/40 bg-surface', title: 'text-accent-2', body: 'text-ink' },
  vision: { box: 'border-dawn/45 bg-[#1b1812]', title: 'text-dawn', body: 'font-serif text-dawn-2' },
  note: { box: 'border-dawn/30 bg-[#15141a]', title: 'text-dawn', body: 'font-serif text-dawn-2' },
  image: { box: 'border-border bg-bg', title: 'text-muted', body: 'text-muted' },
}

export function MapView({ studio, go }: { studio: StudioApi; go: Go }) {
  const { state, today, update, announce } = studio
  const layout = useMemo(() => layoutMap(state, today), [state, today])
  const [camera, setCamera] = useState<Camera>(state.canvas.view)
  const [dragged, setDragged] = useState<{ id: string; x: number; y: number } | null>(null)
  const [mode, setMode] = useState<'canvas' | 'list'>('canvas')
  const [editing, setEditing] = useState<string | null>(null)
  const [images, setImages] = useState<Record<string, { url: string; type: string }>>({})
  const surface = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<Gesture | null>(null)
  const fitted = useRef(false)
  const imageKey = state.canvas.cards.filter((card) => card.imageId).map((card) => card.imageId).join(',')
  /** One object URL per image while the map is open: kept across changes so pictures never flash, revoked when unused. */
  const urls = useRef(new Map<string, { url: string; type: string }>())

  useEffect(() => {
    let cancelled = false
    const ids = imageKey ? imageKey.split(',') : []
    ;(async () => {
      for (const id of ids) {
        if (urls.current.has(id)) continue
        const image = await getImage(id)
        if (!image || cancelled || urls.current.has(id)) continue
        urls.current.set(id, { url: URL.createObjectURL(image.blob), type: image.blob.type })
      }
      if (cancelled) return
      const keep = new Set(ids)
      for (const [id, entry] of urls.current) {
        if (keep.has(id)) continue
        URL.revokeObjectURL(entry.url)
        urls.current.delete(id)
      }
      setImages(Object.fromEntries(urls.current))
    })()
    return () => {
      cancelled = true
    }
  }, [imageKey])

  useEffect(() => {
    const cache = urls.current
    return () => {
      for (const entry of cache.values()) URL.revokeObjectURL(entry.url)
      cache.clear()
    }
  }, [])

  const fit = useCallback(() => {
    const rect = surface.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    if (!layout.nodes.length) {
      setCamera({ x: rect.width / 2 - 160, y: 120, zoom: 0.8 })
      return
    }
    const minX = layout.bounds.minX
    const minY = Math.min(layout.bounds.minY, -120)
    const width = layout.bounds.maxX - minX + 160
    const height = layout.bounds.maxY - minY + 160
    const zoom = clamp(Math.min(rect.width / width, rect.height / height), MIN_ZOOM, 1.2)
    setCamera({ x: (rect.width - (layout.bounds.maxX - minX) * zoom) / 2 - minX * zoom, y: (rect.height - (layout.bounds.maxY - minY) * zoom) / 2 - minY * zoom, zoom })
  }, [layout])

  /** Opens at a readable zoom on the left (Now) edge of the map, the way canvas tools open; Fit shows everything. */
  const home = useCallback(() => {
    const rect = surface.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    if (!layout.nodes.length) return fit()
    const zoom = rect.width < 640 ? 0.62 : 0.8
    // Anchor on the column-label row (y = -100) so the opening view starts at the labels, not at a far-off note.
    setCamera({ zoom, x: 24 - layout.bounds.minX * zoom, y: 32 + 130 * zoom })
  }, [fit, layout])

  /** Pans so a column (Now, Bridges or Vision) sits at the left edge, keeping zoom and height. */
  const jumpTo = (x: number, label: string) => {
    setCamera((current) => ({ ...current, x: 24 - x * current.zoom }))
    announce(`Map moved to ${label}.`)
  }

  useEffect(() => {
    if (fitted.current || mode !== 'canvas') return
    fitted.current = true
    const view = state.canvas.view
    if (view.x === 0 && view.y === 0) home()
  }, [home, mode, state.canvas.view])

  // Keep the camera between visits, without rewriting the whole state on every frame.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = state.canvas.view
      if (saved.x !== camera.x || saved.y !== camera.y || saved.zoom !== camera.zoom) update((draft) => { draft.canvas.view = camera })
    }, 700)
    return () => window.clearTimeout(timer)
  }, [camera, state.canvas.view, update])

  const zoomAt = useCallback((factor: number, px?: number, py?: number) => {
    const rect = surface.current?.getBoundingClientRect()
    setCamera((current) => {
      const zoom = clamp(current.zoom * factor, MIN_ZOOM, MAX_ZOOM)
      const x = px ?? (rect ? rect.width / 2 : 0)
      const y = py ?? (rect ? rect.height / 2 : 0)
      return { zoom, x: x - (x - current.x) * (zoom / current.zoom), y: y - (y - current.y) * (zoom / current.zoom) }
    })
  }, [])

  // Ctrl/⌘ + wheel and trackpad pinch zoom the map; a plain wheel keeps scrolling the page.
  useEffect(() => {
    const element = surface.current
    if (!element) return
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const rect = element.getBoundingClientRect()
      zoomAt(Math.exp(-event.deltaY * 0.0025), event.clientX - rect.left, event.clientY - rect.top)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [zoomAt, mode])

  const nodePosition = (node: MapNode) => (dragged?.id === node.id ? { x: dragged.x, y: dragged.y } : { x: node.x, y: node.y })

  const commitMove = (node: MapNode, x: number, y: number) => {
    update((draft) => {
      if (node.free) {
        const card = draft.canvas.cards.find((item) => `card:${item.id}` === node.id)
        if (card) {
          card.x = Math.round(x)
          card.y = Math.round(y)
        }
      } else {
        draft.canvas.positions[node.id] = { x: Math.round(x), y: Math.round(y) }
      }
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, textarea, input, a')) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const rect = surface.current?.getBoundingClientRect()
      gesture.current = { kind: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y), camera, midX: (a.x + b.x) / 2 - (rect?.left ?? 0), midY: (a.y + b.y) / 2 - (rect?.top ?? 0) }
      setDragged(null)
      return
    }
    const element = target.closest<HTMLElement>('[data-node]')
    const node = element ? layout.nodes.find((item) => item.id === element.dataset.node) : undefined
    if (node && editing !== node.id) {
      // A card is captured only once it is really dragged, so a click or double-click still reaches it.
      gesture.current = { kind: 'node', id: node.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: { x: node.x, y: node.y }, moved: false, x: node.x, y: node.y }
    } else if (!node) {
      surface.current?.setPointerCapture(event.pointerId)
      gesture.current = { kind: 'pan', startX: event.clientX, startY: event.clientY, camera }
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const current = gesture.current
    if (!current) return
    if (current.kind === 'pinch' && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const zoom = clamp(current.camera.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / current.distance), MIN_ZOOM, MAX_ZOOM)
      const ratio = zoom / current.camera.zoom
      setCamera({ zoom, x: current.midX - (current.midX - current.camera.x) * ratio, y: current.midY - (current.midY - current.camera.y) * ratio })
    } else if (current.kind === 'pan') {
      setCamera({ ...current.camera, x: current.camera.x + event.clientX - current.startX, y: current.camera.y + event.clientY - current.startY })
    } else if (current.kind === 'node') {
      const dx = (event.clientX - current.startX) / camera.zoom
      const dy = (event.clientY - current.startY) / camera.zoom
      if (!current.moved && Math.hypot(dx, dy) < 3) return
      if (!current.moved) surface.current?.setPointerCapture(current.pointerId)
      current.moved = true
      current.x = current.origin.x + dx
      current.y = current.origin.y + dy
      setDragged({ id: current.id, x: current.x, y: current.y })
    }
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    const current = gesture.current
    // Commit from the gesture itself: the last rendered drag position can lag one frame behind the pointer.
    if (current?.kind === 'node' && current.moved) {
      const node = layout.nodes.find((item) => item.id === current.id)
      if (node) commitMove(node, current.x, current.y)
    }
    if (pointers.current.size === 0) {
      gesture.current = null
      setDragged(null)
    }
  }

  const onSurfaceKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const step = event.shiftKey ? 180 : 60
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
    if (moves[event.key]) {
      event.preventDefault()
      setCamera((current) => ({ ...current, x: current.x + moves[event.key][0], y: current.y + moves[event.key][1] }))
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomAt(1.2)
    } else if (event.key === '-') {
      event.preventDefault()
      zoomAt(1 / 1.2)
    } else if (event.key === '0') {
      event.preventDefault()
      fit()
    }
  }

  // The stored image itself is cleaned up on a later visit, once no saved card in any tab uses it.
  const removeCard = (node: MapNode) => {
    update((draft) => { draft.canvas.cards = draft.canvas.cards.filter((card) => `card:${card.id}` !== node.id) })
    announce(node.tone === 'image' ? 'Image removed from the map.' : 'Note removed from the map.')
    surface.current?.focus()
  }

  const onNodeKey = (event: KeyboardEvent<HTMLDivElement>, node: MapNode) => {
    if (event.target !== event.currentTarget) return
    const step = event.shiftKey ? 80 : 20
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[event.key]) {
      event.preventDefault()
      commitMove(node, node.x + moves[event.key][0], node.y + moves[event.key][1])
    } else if (event.key === 'Enter' && node.tone === 'note') {
      event.preventDefault()
      setEditing(node.id)
    } else if ((event.key === 'Delete' || event.key === 'Backspace') && node.free) {
      event.preventDefault()
      removeCard(node)
    }
  }

  const center = () => {
    const rect = surface.current?.getBoundingClientRect()
    const width = rect?.width ?? 800
    const height = rect?.height ?? 500
    return { x: Math.round((width / 2 - camera.x) / camera.zoom), y: Math.round((height / 2 - camera.y) / camera.zoom) }
  }

  const addNote = () => {
    const spot = center()
    const id = newId()
    update((draft) => { draft.canvas.cards.push({ id, kind: 'note', text: '', x: spot.x - 140, y: spot.y - 70, w: 280, h: 140 }) })
    setMode('canvas')
    setEditing(`card:${id}`)
  }

  const addImage = async (file: File | undefined) => {
    if (!file) return
    const imageId = await putImage(file, file.name)
    if (!imageId) {
      announce('That file could not be added. Use an image up to 15 MB, in a browser that allows saving on this device.')
      return
    }
    const spot = center()
    update((draft) => { draft.canvas.cards.push({ id: newId(), kind: 'image', text: file.name, imageId, x: spot.x - 160, y: spot.y - 110, w: 320, h: 220 }) })
    announce('Image added to your map. It stays on this device.')
  }

  const exportCanvas = () => {
    const canvas = toJsonCanvas(layout, (imageId) => (images[imageId] ? `${ROOT}reality/images/${imageId}.${imageExtension(images[imageId].type)}` : null))
    downloadText('Reality Map.canvas', `${JSON.stringify(canvas, null, 2)}\n`, 'application/json;charset=utf-8')
    announce('Map downloaded. The full export from the Export button also includes your images.')
  }

  const edges = layout.edges.flatMap((edge) => {
    const from = layout.nodes.find((node) => node.id === edge.from)
    const to = layout.nodes.find((node) => node.id === edge.to)
    if (!from || !to) return []
    const a = nodePosition(from)
    const b = nodePosition(to)
    const x1 = a.x + from.w
    const y1 = a.y + from.h / 2
    const x2 = b.x
    const y2 = b.y + to.h / 2
    const bend = Math.max(60, Math.abs(x2 - x1) / 2)
    return [{ id: edge.id, d: `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`, vision: to.tone === 'vision' }]
  })

  const grid = 32 * camera.zoom

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Map tools">
        <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="View as">
          <button type="button" aria-pressed={mode === 'canvas'} className={`rounded-md px-3 py-1.5 text-sm ${mode === 'canvas' ? 'bg-accent/15 text-ink' : 'text-muted hover:text-ink'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`} onClick={() => setMode('canvas')}>Canvas</button>
          <button type="button" aria-pressed={mode === 'list'} className={`rounded-md px-3 py-1.5 text-sm ${mode === 'list' ? 'bg-accent/15 text-ink' : 'text-muted hover:text-ink'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`} onClick={() => setMode('list')}>List</button>
        </div>
        {mode === 'canvas' && (
          <>
            <button type="button" className={button.secondary} onClick={() => zoomAt(1 / 1.2)} aria-label="Zoom out">−</button>
            <button type="button" className={button.secondary} onClick={() => zoomAt(1.2)} aria-label="Zoom in">+</button>
            <button type="button" className={button.secondary} onClick={fit}>Fit</button>
            {layout.nodes.length > 0 && (
              <div className="flex gap-1 rounded-lg border border-border p-1" role="group" aria-label="Jump to a column">
                {([['Now', 0], ['Bridges', 420], ['Vision', layout.visionX]] as const).map(([label, x]) => (
                  <button key={label} type="button" className={`rounded-md px-3 py-1.5 text-sm ${label === 'Vision' ? 'text-dawn' : 'text-muted'} hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`} onClick={() => jumpTo(x, label)}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <button type="button" className={button.secondary} onClick={addNote}>Add note</button>
        <button type="button" className={button.secondary} onClick={() => fileInput.current?.click()}>Add image</button>
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(event) => { void addImage(event.target.files?.[0]); event.target.value = '' }} />
        <button type="button" className={button.secondary} onClick={exportCanvas}>Download .canvas</button>
      </div>

      {mode === 'canvas' ? (
        <>
          <div
            ref={surface}
            role="region"
            aria-label="Reality Map canvas. Arrow keys pan, plus and minus zoom, zero fits. Tab moves between cards; arrows move a card."
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onSurfaceKey}
            className="relative h-[70vh] min-h-[26rem] cursor-grab touch-none select-none overflow-hidden rounded-2xl border border-border bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
            style={{
              backgroundImage: 'linear-gradient(rgba(91,140,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(91,140,255,0.06) 1px, transparent 1px)',
              backgroundSize: `${grid}px ${grid}px`,
              backgroundPosition: `${camera.x}px ${camera.y}px`,
            }}
          >
            {layout.nodes.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
                <div className="pointer-events-auto max-w-md">
                  <Empty
                    title="Your map fills in as you build"
                    actions={<><button type="button" className={button.secondary} onClick={() => go('soul')}>Write your scene</button><button type="button" className={button.secondary} onClick={() => go('bridges')}>Start a bridge</button></>}
                  >
                    Now sits on the left, the life you are building on the right, and every bridge crosses between them.
                  </Empty>
                </div>
              </div>
            )}
            <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}>
              {layout.nodes.length > 0 && (
                <div aria-hidden="true" className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.3em]">
                  <span className="absolute text-muted" style={{ left: 0, top: -100 }}>Now · reported</span>
                  <span className="absolute text-accent" style={{ left: 420, top: -100 }}>Bridges · planned and witnessed</span>
                  <span className="absolute text-dawn" style={{ left: layout.visionX, top: -100 }}>Vision · desired</span>
                </div>
              )}
              <svg className="absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden="true">
                {edges.map((edge) => <path key={edge.id} d={edge.d} fill="none" stroke={edge.vision ? 'rgba(232,213,173,0.45)' : 'rgba(91,140,255,0.45)'} strokeWidth="2" strokeDasharray={edge.vision ? '6 6' : undefined} />)}
              </svg>
              {layout.nodes.map((node) => {
                const position = nodePosition(node)
                const tone = TONE[node.tone]
                const image = node.imageId ? images[node.imageId] : undefined
                return (
                  <div
                    key={node.id}
                    data-node={node.id}
                    tabIndex={0}
                    role="group"
                    aria-label={`${node.title || (node.tone === 'image' ? 'Image' : 'Note')}: ${node.body || 'empty'}`}
                    onKeyDown={(event) => onNodeKey(event, node)}
                    onDoubleClick={() => { if (node.tone === 'note') setEditing(node.id) }}
                    className={`group absolute overflow-hidden rounded-xl border p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${tone.box}`}
                    style={{ left: position.x, top: position.y, width: node.w, minHeight: node.h }}
                  >
                    {node.title && <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${tone.title}`}>{node.title}</p>}
                    {node.tone === 'image' ? (
                      image ? (
                        // A blob URL from this device's own storage; next/image cannot optimize it.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image.url} alt={node.body || 'An image on your vision board'} width={node.w - 24} height={node.h - 24} draggable={false} className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <p className="text-sm text-muted">Image not on this device. Images stay where they were added; the full export carries copies.</p>
                      )
                    ) : editing === node.id ? (
                      <textarea
                        autoFocus
                        aria-label="Note text"
                        defaultValue={node.body}
                        rows={4}
                        onChange={(event) => {
                          const text = event.target.value
                          update((draft) => { const card = draft.canvas.cards.find((item) => `card:${item.id}` === node.id); if (card) card.text = text })
                        }}
                        onBlur={() => setEditing(null)}
                        onKeyDown={(event) => { if (event.key === 'Escape') (event.target as HTMLTextAreaElement).blur() }}
                        className="w-full resize-none rounded-md border border-dawn/30 bg-bg p-2 font-serif text-sm text-dawn-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn"
                      />
                    ) : (
                      <p className={`mt-1.5 line-clamp-6 whitespace-pre-wrap text-[15px] leading-snug ${tone.body}`}>{node.body || (node.tone === 'note' ? 'Empty note. Press Enter or double-click to write.' : '')}</p>
                    )}
                    {node.free && editing !== node.id && (
                      <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        {node.tone === 'note' && <button type="button" className="rounded px-2 py-1 text-xs text-muted hover:text-ink focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => setEditing(node.id)}>Edit</button>}
                        <button type="button" className="rounded px-2 py-1 text-xs text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => removeCard(node)}>Remove</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <p className="text-xs text-muted">Drag to pan · pinch or Ctrl + scroll to zoom · drag a card to place it · with the keyboard: arrows pan, + and − zoom, 0 fits, Tab reaches each card and arrows move it.</p>
        </>
      ) : (
        <MapList nodes={layout.nodes} />
      )}
    </div>
  )
}

function MapList({ nodes }: { nodes: MapNode[] }) {
  const groups: { title: string; tones: MapTone[] }[] = [
    { title: 'Now (reported)', tones: ['now'] },
    { title: 'Bridges (planned and witnessed)', tones: ['bridge', 'rep', 'move', 'reach', 'witness'] },
    { title: 'Vision (desired)', tones: ['vision'] },
    { title: 'Your notes and images', tones: ['note', 'image'] },
  ]
  if (!nodes.length) return <Empty title="Nothing on the map yet">Write a scene in Soul or start a bridge, and the map fills in.</Empty>
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map((group) => {
        const items = nodes.filter((node) => group.tones.includes(node.tone))
        if (!items.length) return null
        return (
          <section key={group.title} aria-label={group.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{group.title}</h3>
            <ul className="mt-3 space-y-2">
              {items.map((node) => (
                <li key={node.id} className={`rounded-xl border p-3 ${TONE[node.tone].box}`}>
                  {node.title && <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${TONE[node.tone].title}`}>{node.title}</p>}
                  <p className={`mt-1 whitespace-pre-wrap text-sm ${TONE[node.tone].body}`}>{node.body || (node.tone === 'image' ? 'Image' : 'Empty note')}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
