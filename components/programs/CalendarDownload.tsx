'use client'

import { useEffect, useId, useState, type FormEvent } from 'react'
import { addDays, buildProgramIcs, icsFileName, isIcsDate, isIcsTime, type IcsDay } from '@/lib/programs/ics'

/**
 * "Add the thirty days to my calendar": a start date, a time, and one .ics file written in the browser. Nothing is
 * sent anywhere. The inputs carry no `name`, so even a form submitted before hydration sends no date to the server.
 */

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
const INPUT = `mt-1.5 block min-h-11 w-full rounded-lg border border-border bg-bg px-3.5 py-2 font-mono text-sm text-ink ${FOCUS}`
const DEFAULT_TIME = '07:00'
/** The usual length of a day's practice, for a day that does not carry its own. */
const DEFAULT_MINUTES = 10

const pad = (value: number) => String(value).padStart(2, '0')

/** Tomorrow on this device's own calendar, as YYYY-MM-DD. */
function tomorrow(): string {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
/** A calendar date for reading, such as "Wed 7 Oct 2026". Formatted in UTC, so no zone can shift it by a day. */
const readable = (date: string) => DAY_FORMAT.format(new Date(`${date}T00:00:00Z`))

export function CalendarDownload({ days }: { days: IcsDay[] }) {
  const id = useId()
  const [start, setStart] = useState('')
  const [time, setTime] = useState(DEFAULT_TIME)
  const [status, setStatus] = useState('')

  // The default start is tomorrow on the person's own calendar, so it is chosen in the browser, not at build time.
  useEffect(() => {
    setStart((current) => current || tomorrow())
  }, [])

  // Some browsers report a time with seconds; the file needs HH:MM.
  const clock = time.slice(0, 5)
  const ready = isIcsDate(start) && isIcsTime(clock) && days.length > 0

  const download = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready) {
      setStatus('Choose a start date and a time first.')
      return
    }
    let text: string
    try {
      text = buildProgramIcs({ start, time: clock, minutes: DEFAULT_MINUTES, days })
    } catch {
      setStatus('That date or time could not be read. Choose them again with the pickers.')
      return
    }
    const name = icsFileName(start)
    const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus(`${name} is downloading: ${days.length} events. Open it with your calendar app to add them.`)
  }

  return (
    <section aria-labelledby={`${id}-title`} className="mt-12 max-w-3xl rounded-2xl border border-border bg-surface/70 p-5 sm:p-6">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Calendar · made on this device</p>
      <h2 id={`${id}-title`} className="mt-1 text-2xl font-bold text-ink">Put the thirty days in your calendar.</h2>
      <p className="mt-3 max-w-[35rem] text-sm leading-relaxed text-muted">
        Choose the day you start and a time. Your browser writes one <code className="font-mono text-ink">.ics</code> file
        with an event for each day: its title, its intent, its length and its link. The date and time stay on this device.
      </p>

      <form onSubmit={download} className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div>
          <label htmlFor={`${id}-start`} className="block text-sm font-semibold text-ink">Start date</label>
          <input
            id={`${id}-start`}
            type="date"
            required
            value={start}
            onChange={(event) => { setStart(event.target.value); setStatus('') }}
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor={`${id}-time`} className="block text-sm font-semibold text-ink">Time each day</label>
          <input
            id={`${id}-time`}
            type="time"
            required
            step={60}
            value={time}
            onChange={(event) => { setTime(event.target.value); setStatus('') }}
            autoComplete="off"
            className={INPUT}
          />
        </div>
        <button
          type="submit"
          className={`inline-flex min-h-11 items-center justify-center rounded-lg border border-accent/60 px-5 text-sm font-semibold text-ink hover:border-accent hover:bg-accent/10 ${FOCUS}`}
        >
          Download .ics
        </button>
      </form>

      <p className="mt-4 font-mono text-xs leading-relaxed text-muted">
        {ready
          ? `${days.length} events · ${clock} your local time · ${readable(start)} to ${readable(addDays(start, days.length - 1))}`
          : `${days.length} events · choose a date and a time`}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Floating local time: each event stays at the time you chose wherever your calendar is set, through daylight-saving
        changes. No alarms are added.
      </p>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-ink">{status}</p>
      <noscript>
        <p className="mt-3 text-sm text-muted">Your browser writes this file, so it needs JavaScript turned on.</p>
      </noscript>
    </section>
  )
}
