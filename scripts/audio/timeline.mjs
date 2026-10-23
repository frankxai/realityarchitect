/**
 * Pure planning for guided audio: a voice script becomes speech segments, silences and music cues, and, once the
 * spoken segments have durations, a timeline of music spans. No I/O here; scripts/audio/build.mjs does the rest.
 *
 * Script format (the one the audio companion scripts use):
 *   front matter between --- lines; `# Title` lines are not voiced;
 *   `[pause 3s]` is silence on the voice track; `[music: cue]` starts or changes the bed;
 *   every other non-empty line is spoken. Consecutive spoken lines are voiced together for natural prosody.
 *   A line that opens with "Meaning." or "Mechanism." gets a short beat after the signpost, the same in every track.
 */

import crypto from 'node:crypto'

export const SIGNPOST_BEAT = 0.6
export const CROSSFADE = 4
export const FIRST_FADE_IN = 1.5
export const FINAL_FADE_OUT = 4

export function parseFront(text) {
  const front = {}
  for (const line of text.split(/\r?\n/)) {
    const pair = /^([\w-]+):\s*(.*)$/.exec(line)
    if (!pair) continue
    let value = pair[2].trim()
    if (/^\[.*\]$/.test(value)) value = value.slice(1, -1).split(',').map((part) => part.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    else if (/^".*"$|^'.*'$/.test(value)) value = value.slice(1, -1)
    else if (/^-?\d+(\.\d+)?$/.test(value)) value = Number(value)
    front[pair[1]] = value
  }
  return front
}

/** Script text → { front, events } where events are speech, pause and music in order. */
export function parseScript(source) {
  const text = source.replace(/^﻿/, '')
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  const front = fm ? parseFront(fm[1]) : {}
  const events = []
  const speak = (line) => {
    const last = events[events.length - 1]
    if (last && last.type === 'speech') last.text += ` ${line}`
    else events.push({ type: 'speech', text: line })
  }
  for (const raw of (fm ? text.slice(fm[0].length) : text).split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const pause = /^\[pause\s+(\d+(?:\.\d+)?)\s*s\]$/i.exec(line)
    const music = /^\[music:\s*([\w-]+)\s*\]$/i.exec(line)
    if (pause) events.push({ type: 'pause', seconds: Number(pause[1]) })
    else if (music) events.push({ type: 'music', cue: music[1].toLowerCase() })
    else if (/^\[.*\]$/.test(line)) throw new Error(`Unknown direction: ${line}`)
    else {
      const signpost = /^(Meaning|Mechanism)\.\s+(.+)$/.exec(line)
      if (signpost) {
        speak(`${signpost[1]}.`)
        events.push({ type: 'pause', seconds: SIGNPOST_BEAT })
        speak(signpost[2])
      } else speak(line)
    }
  }
  return { front, events }
}

/** Characters sent to the voice provider for this script. */
export function voicedCharacters(events) {
  return events.filter((event) => event.type === 'speech').reduce((total, event) => total + event.text.length, 0)
}

/** Seconds of tail after the closing music line: shorter for the three-minute morning sets. */
export function tailSeconds(front) {
  return Number(front.minutes) > 0 && Number(front.minutes) <= 3.5 ? 6 : 10
}

/**
 * Given each speech event's measured duration (seconds, in order), lay out the voice track and the music spans.
 * Returns { voice: [{ kind: 'speech'|'silence', index?, seconds, start }], spans: [{ cue, start, end, fadeIn, fadeOut }], total }.
 */
export function layout(events, speechDurations, tail = 10) {
  const voice = []
  const cues = []
  let t = 0
  let speechIndex = 0
  for (const event of events) {
    if (event.type === 'speech') {
      const seconds = speechDurations[speechIndex]
      if (!(seconds > 0)) throw new Error(`Missing duration for speech segment ${speechIndex}`)
      voice.push({ kind: 'speech', index: speechIndex, seconds, start: t })
      speechIndex++
      t += seconds
    } else if (event.type === 'pause') {
      voice.push({ kind: 'silence', seconds: event.seconds, start: t })
      t += event.seconds
    } else cues.push({ cue: event.cue, at: t })
  }
  if (speechIndex !== speechDurations.length) throw new Error(`Got ${speechDurations.length} durations for ${speechIndex} speech segments`)
  const voiceEnd = t
  const total = cues.length ? voiceEnd + tail : voiceEnd
  // Consecutive identical cues simply continue; a change crossfades around the cue point.
  const changes = cues.filter((cue, index) => index === 0 || cue.cue !== cues[index - 1].cue)
  const spans = changes.map((change, index) => {
    const next = changes[index + 1]
    const start = index === 0 ? 0 : Math.max(0, change.at - CROSSFADE / 2)
    const end = next ? Math.min(total, next.at + CROSSFADE / 2) : total
    return { cue: change.cue, start, end, fadeIn: index === 0 ? FIRST_FADE_IN : CROSSFADE, fadeOut: next ? CROSSFADE : FINAL_FADE_OUT }
  })
  return { voice, spans, total, voiceEnd }
}

/**
 * The cache key of one synthesized segment: the text, the voice settings, and the context sent with it
 * (previous_text / next_text shape the delivery), so a line in a new place is voiced again, not reused.
 */
export function segmentKey(text, context, opts) {
  const value = { text, previous: context?.previous ?? '', next: context?.next ?? '', provider: opts.provider, voice: opts.voice ?? '', model: opts.model, v: 2 }
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24)
}

/** One line of an ffmpeg concat list: forward slashes, and a single quote escaped the way the demuxer reads it. */
export function concatLine(file) {
  const quote = String.fromCharCode(39)
  const escaped = file.replace(/\\/g, '/').split(quote).join(`${quote}\\${quote}${quote}`)
  return `file ${quote}${escaped}${quote}`
}

export function formatTime(seconds) {
  const s = Math.round(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
