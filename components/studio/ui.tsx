'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'

/**
 * Shared Studio primitives. Every personal field shows its register: the person's own desired scenes and meanings
 * render in dawn serif; reported facts, plans and computed numbers stay in the blueprint system face.
 */

export type Register = 'desired' | 'reported' | 'planned' | 'done' | 'meaning' | 'computed'

const REGISTER_TEXT: Record<Register, string> = {
  desired: 'Desired',
  reported: 'Reported',
  planned: 'Planned',
  done: 'Done',
  meaning: 'Your meaning',
  computed: 'Computed',
}

export function Tag({ register }: { register: Register }) {
  const dawn = register === 'desired' || register === 'meaning'
  return (
    <span className={`ml-2 inline-flex rounded-full border px-2 py-0.5 align-middle font-mono text-[0.62rem] font-medium uppercase tracking-[0.14em] ${dawn ? 'border-dawn/35 text-dawn' : 'border-accent/35 text-accent'}`}>
      {REGISTER_TEXT[register]}
    </span>
  )
}

const ring = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export const inputClass = `mt-1.5 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 ${ring} focus-visible:ring-accent`
export const dawnInputClass = `mt-1.5 w-full rounded-lg border border-dawn/20 bg-bg px-3.5 py-3 font-serif text-base leading-relaxed text-dawn-2 placeholder:text-muted/60 ${ring} focus-visible:ring-dawn`

export const button = {
  primary: `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${ring} focus-visible:ring-accent`,
  secondary: `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 ${ring} focus-visible:ring-accent`,
  dawn: `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-dawn px-4 py-2 text-sm font-semibold text-bg hover:bg-dawn-2 disabled:cursor-not-allowed disabled:opacity-40 ${ring} focus-visible:ring-dawn`,
  ghost: `inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline ${ring} focus-visible:ring-accent`,
  danger: `inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#ff8f8f]/40 px-4 py-2 text-sm font-medium text-[#ffb4b4] hover:border-[#ff8f8f] ${ring} focus-visible:ring-[#ff8f8f]`,
}

export const panelClass = 'rounded-2xl border border-border bg-surface/80 p-5 sm:p-6'

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  register?: Register
  hint?: string
  placeholder?: string
  type?: 'text' | 'date' | 'number'
  min?: number
  max?: number
  dawn?: boolean
}

export function Field({ label, value, onChange, register, hint, placeholder, type = 'text', min, max, dawn }: FieldProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {register && <Tag register={register} />}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={dawn ? dawnInputClass : inputClass}
      />
    </div>
  )
}

interface AreaProps {
  label: string
  value: string
  onChange: (value: string) => void
  register?: Register
  hint?: string
  placeholder?: string
  rows?: number
  dawn?: boolean
}

export function Area({ label, value, onChange, register, hint, placeholder, rows = 3, dawn }: AreaProps) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {register && <Tag register={register} />}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={dawn ? dawnInputClass : inputClass}
      />
    </div>
  )
}

interface ListEditorProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  register?: Register
  hint?: string
  placeholder?: string
  addLabel?: string
  dawn?: boolean
  ordered?: boolean
  max?: number
}

/** An editable list of short lines. Enter adds; each line can be edited, moved (when ordered) or removed. */
const drafts = new Map<string, unknown>()

/**
 * Form state that survives switching Studio views. It lives in memory for this page visit only: it is never stored,
 * and a reload starts the form empty.
 */
export function useDraft<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => (drafts.has(key) ? (drafts.get(key) as T) : initial))
  const set = useCallback((next: T) => {
    drafts.set(key, next)
    setValue(next)
  }, [key])
  return [value, set]
}

/** Sets a draft before its view mounts, so a link from one view can open another in a chosen state. In memory only. */
export function presetDraft<T>(key: string, value: T) {
  drafts.set(key, value)
}

let keySeq = 0
const nextKey = () => `item-${(keySeq += 1)}`

export function ListEditor({ label, items, onChange, register, hint, placeholder, addLabel = 'Add', dawn, ordered, max = 30 }: ListEditorProps) {
  const id = useId()
  const [draft, setDraft] = useState('')
  // Stable keys, so typing into an item never remounts its input and moves keep focus with the item.
  const keys = useRef<string[]>([])
  if (keys.current.length !== items.length) keys.current = items.map((_, index) => keys.current[index] ?? nextKey())
  const add = () => {
    const value = draft.trim()
    if (!value || items.length >= max) return
    keys.current = [...keys.current, nextKey()]
    onChange([...items, value])
    setDraft('')
  }
  const remove = (index: number) => {
    keys.current = keys.current.filter((_, i) => i !== index)
    onChange(items.filter((_, i) => i !== index))
  }
  const move = (index: number, by: number) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    const order = [...keys.current]
    const [key] = order.splice(index, 1)
    order.splice(index + by, 0, key)
    keys.current = order
    onChange(next)
  }
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">
        {label}
        {register && <Tag register={register} />}
      </legend>
      {hint && <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p>}
      {items.length > 0 && (
        <ul className="mt-2 space-y-2">
          {items.map((item, index) => (
            <li key={keys.current[index]} className="flex items-start gap-2">
              {ordered && <span className="mt-3 w-5 shrink-0 text-right font-mono text-xs text-muted">{index + 1}.</span>}
              <input
                aria-label={`${label}, item ${index + 1}`}
                value={item}
                onChange={(event) => onChange(items.map((current, i) => (i === index ? event.target.value : current)))}
                onBlur={() => { if (!items[index]?.trim()) remove(index) }}
                className={`${dawn ? dawnInputClass : inputClass} mt-0`}
              />
              {ordered && (
                <>
                  <button type="button" className={button.ghost} disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move "${item}" up`}>↑</button>
                  <button type="button" className={button.ghost} disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move "${item}" down`}>↓</button>
                </>
              )}
              <button type="button" className={button.ghost} onClick={() => remove(index)} aria-label={`Remove "${item}"`}>Remove</button>
            </li>
          ))}
        </ul>
      )}
      {items.length < max && (
        <div className="mt-2 flex gap-2">
          <input
            id={id}
            aria-label={`New ${label.toLowerCase()} line`}
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                add()
              }
            }}
            className={`${dawn ? dawnInputClass : inputClass} mt-0`}
          />
          <button type="button" className={button.secondary} onClick={add} disabled={!draft.trim()}>{addLabel}</button>
        </div>
      )}
    </fieldset>
  )
}

/** A destructive action that asks once more in place, then resets after six seconds. */
export function ConfirmButton({ label, confirmLabel, onConfirm, className = button.danger }: { label: string; confirmLabel: string; onConfirm: () => void; className?: string }) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <button
      type="button"
      className={className}
      aria-live="polite"
      onClick={() => {
        if (armed) {
          window.clearTimeout(timer.current)
          setArmed(false)
          onConfirm()
          return
        }
        setArmed(true)
        timer.current = window.setTimeout(() => setArmed(false), 6000)
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  )
}

export function Empty({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center sm:p-10">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{children}</div>
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  )
}

/** Downloads text as a file through a temporary object URL (revoked after the browser starts the transfer). */
export function downloadText(name: string, text: string, type = 'text/markdown;charset=utf-8') {
  downloadBlob(name, new Blob([text], { type }))
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
