'use client'

import Link from 'next/link'
import { DAYS, SLUG } from '@/lib/programs/program'
import {
  PROGRAM_NAME, SEP, dayHref, dayLine, offerMonthSnapshot, programCells, programStatus, startProgram, statusLabel, toggleDay,
  type ProgramDay,
} from '@/lib/studio/program'
import { ConfirmButton, Tag, button, panelClass, presetDraft } from './ui'
import type { StudioApi } from './useStudio'
import type { Go } from './views'

/**
 * The free 30-day program inside the Studio. The day count, minutes and marks are mechanism (blueprint, mono); the
 * day's intent is meaning (dawn, serif). Progress is a start date and the days marked done, kept on this device.
 * Counts, not streaks: a day that is not marked is just a day.
 */

const dataFor = (days: ProgramDay[], day: number) => days.find((entry) => entry.day === day)

/** "day 3", "days 2 and 3", "days 2, 3 and 5", or "6 days". */
function dayList(days: number[]): string {
  if (days.length === 1) return `day ${days[0]}`
  if (days.length > 3) return `${days.length} days`
  return `days ${days.slice(0, -1).join(', ')} and ${days[days.length - 1]}`
}

/** Today: where the person is in the thirty days, the day's intent, its page, and the mark for today. */
export function ProgramToday({ studio, go, days }: { studio: StudioApi; go: Go; days: ProgramDay[] }) {
  const { state, today, update, announce } = studio
  const program = state.program
  const status = programStatus(program, today)
  const data = dataFor(days, status.day)
  const offer = offerMonthSnapshot(program, state.snapshots, today)

  const start = () => {
    update((draft) => { draft.program = startProgram(today) })
    announce(`The ${DAYS} days start today. Day 1 is kept on this device.`)
  }
  const markToday = () => {
    if (status.state !== 'day') return
    update((draft) => { if (draft.program) draft.program = toggleDay(draft.program, status.day) })
    announce(status.doneToday ? `Day ${status.day} is no longer marked done.` : `Day ${status.day} marked done.`)
  }
  const sealMonth = () => {
    // The Timeline opens with the monthly review chosen; sealing stays the person's own act there.
    presetDraft('snapshot:cadence', 'monthly')
    go('timeline')
  }

  return (
    <section className={panelClass} aria-labelledby="program-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{PROGRAM_NAME}{SEP}{statusLabel(status)}</p>
        {program && status.state !== 'not-started' && (
          <p className="font-mono text-xs text-muted"><span className="text-ink">{status.doneCount}</span> of {DAYS} marked done</p>
        )}
      </div>
      <h3 id="program-title" className="mt-2 font-mono text-base font-semibold leading-snug text-ink sm:text-lg">
        {status.state === 'complete' ? `The ${DAYS} days are complete` : dayLine(data ?? { day: status.day })}
      </h3>

      {status.state === 'not-started' && program && (
        <p className="mt-1 text-sm text-muted">Day 1 begins on <span className="font-mono text-ink">{program.start}</span>, by this device&rsquo;s calendar.</p>
      )}
      {status.state === 'complete' && program && (
        <p className="mt-1 text-sm text-muted">
          Started <span className="font-mono text-ink">{program.start}</span>{SEP}<span className="font-mono text-ink">{status.doneCount}</span> of {DAYS} days marked done. The day pages stay open.
        </p>
      )}

      {status.state !== 'complete' && data?.intent && (
        <div className="mt-4 rounded-xl border border-dawn/20 bg-dawn/5 p-4 sm:p-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dawn">The day&rsquo;s intent</p>
          <p className="mt-2 font-serif text-lg leading-relaxed text-dawn-2">{data.intent}</p>
        </div>
      )}

      {!program && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className={button.primary} onClick={start}>Start the {DAYS} days</button>
            <Link href={dayHref(1)} className={button.ghost}>Read day 1</Link>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">Starting keeps today&rsquo;s date in this browser as day 1. Each calendar day is the next program day, and a missed day is just a day.</p>
        </>
      )}

      {program && status.state === 'not-started' && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className={button.secondary} onClick={start}>Start today instead</button>
          <Link href={dayHref(1)} className={button.ghost}>Read day 1</Link>
        </div>
      )}

      {program && status.state === 'day' && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={dayHref(status.day)} className={button.secondary}>Open day {status.day}</Link>
            <button type="button" aria-pressed={status.doneToday} className={status.doneToday ? button.primary : button.secondary} onClick={markToday}>
              Day {status.day} done
            </button>
          </div>
          {status.notMarked.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Not marked: {dayList(status.notMarked)}. If you did {status.notMarked.length === 1 ? 'it' : 'them'}, mark {status.notMarked.length === 1 ? 'it' : 'them'} in the{' '}
              <button type="button" className="text-accent underline underline-offset-4" onClick={() => go('timeline')}>Timeline</button>. If not, pick up from today; nothing is owed.
            </p>
          )}
        </>
      )}

      {offer && (
        <div className="mt-5 rounded-xl border border-accent/30 bg-bg/60 p-4">
          <p className="text-sm text-ink">
            {status.state === 'complete' ? 'The month is not sealed yet.' : `Day ${DAYS} closes the month.`} Seal a monthly snapshot of the {DAYS} days in the Timeline. It becomes permanent only when you say it is true for you.
          </p>
          <button type="button" className={`${button.primary} mt-3`} onClick={sealMonth}>Seal the month snapshot</button>
        </div>
      )}

      {program && status.state === 'complete' && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={`/programs/${SLUG}`} className={button.secondary}>The program overview</Link>
          <ConfirmButton label="Start again from today" confirmLabel="Confirm: start again (clears the marks)" className={button.ghost} onConfirm={start} />
        </div>
      )}
    </section>
  )
}

/** Timeline: the thirty days, each marked done or not. The person can mark a day they did and forgot to tick. */
export function ProgramTimeline({ studio, days }: { studio: StudioApi; days: ProgramDay[] }) {
  const { state, today, update, announce } = studio
  const program = state.program
  if (!program) return null
  const status = programStatus(program, today)
  const cells = programCells(program, today)

  const toggle = (day: number, done: boolean) => {
    update((draft) => { if (draft.program) draft.program = toggleDay(draft.program, day) })
    announce(done ? `Day ${day} is no longer marked done.` : `Day ${day} marked done.`)
  }

  return (
    <section className={panelClass} aria-labelledby="program-days-title">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{PROGRAM_NAME}{SEP}{statusLabel(status)}</p>
      <h3 id="program-days-title" className="mt-1 text-lg font-semibold text-ink">The {DAYS} days <Tag register="done" /></h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Started <span className="font-mono text-ink">{program.start}</span>{SEP}<span className="font-mono text-ink">{status.doneCount}</span> marked done
        {status.notMarked.length > 0 && <>{SEP}<span className="font-mono text-ink">{status.notMarked.length}</span> not marked</>}.
        Counts, not streaks: a day that is not marked is just a day. Mark a day you did and forgot to tick.
      </p>
      <ol className="mt-4 grid max-w-2xl grid-cols-6 gap-2 sm:grid-cols-10" aria-label={`The ${DAYS} days`}>
        {cells.map((cell) => {
          const title = dataFor(days, cell.day)?.title
          const name = `Day ${cell.day}${title ? `, ${title}` : ''}${cell.today ? ', today' : ''}`
          return (
            <li key={cell.day}>
              {cell.future ? (
                <span title={title} className="flex h-11 items-center justify-center rounded-lg border border-dashed border-border font-mono text-xs text-muted/60">
                  <span aria-hidden="true">{cell.day}</span>
                  <span className="sr-only">{name}, ahead</span>
                </span>
              ) : (
                <button
                  type="button"
                  aria-pressed={cell.done}
                  aria-label={name}
                  title={title}
                  onClick={() => toggle(cell.day, cell.done)}
                  className={`flex h-11 w-full items-center justify-center rounded-lg font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${cell.done ? 'bg-accent font-semibold text-bg hover:opacity-90' : 'border border-border text-muted hover:border-accent hover:text-ink'} ${cell.today ? 'outline-1 outline-offset-2 outline-accent' : ''}`}
                >
                  {cell.day}
                </button>
              )}
            </li>
          )
        })}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Key">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-accent" />Marked done</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm border border-border" />Not marked</li>
        {status.state === 'day' && <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm outline-1 outline-offset-1 outline-accent" />Today</li>}
        {status.state !== 'complete' && <li className="flex items-center gap-1.5"><span aria-hidden="true" className="h-3 w-3 rounded-sm border border-dashed border-border" />Ahead</li>}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={status.state === 'day' ? dayHref(status.day) : `/programs/${SLUG}`} className={button.ghost}>
          {status.state === 'day' ? `Open day ${status.day}` : 'The program overview'}
        </Link>
        <ConfirmButton
          label="Leave the program"
          confirmLabel="Confirm: remove the start date and the marks"
          className={button.ghost}
          onConfirm={() => { update((draft) => { delete draft.program }); announce('The program was removed from this Studio. Your other entries are unchanged.') }}
        />
      </div>
    </section>
  )
}
