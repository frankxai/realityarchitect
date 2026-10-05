#!/usr/bin/env node
/**
 * Builds guided audio from voice scripts: each spoken segment is synthesized once (cached by content), silences are
 * real silence, music beds crossfade at their cues and duck under the voice, and every track is loudness-normalized
 * in two passes. Writes tagged MP3s, one M4B with chapters, and report.json (durations, loudness, characters voiced).
 *
 *   node scripts/audio/build.mjs --scripts <dir> --out <dir> [--music <dir>] [--only 05] [--dry]
 *        [--provider elevenlabs|sapi] [--voice <id>] [--model eleven_multilingual_v2]
 *        [--album "…"] [--artist "…"] [--comment "…"] [--cover cover.jpg]
 *
 * ElevenLabs reads its key from ELEVENLABS_API_KEY and never logs it. `--provider sapi` uses the Windows speech
 * engine for a placeholder voice, to test the pipeline without spending credits; its output is marked PLACEHOLDER.
 * Needs ffmpeg and ffprobe on PATH. Music beds are <music>/<cue>.(wav|mp3|flac|m4a); a missing bed means voice only.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { concatLine, formatTime, layout, parseScript, segmentKey, tailSeconds, voicedCharacters } from './timeline.mjs'

const RATE = 44100
const TARGET = { I: -16, TP: -1.5, LRA: 11 }
// Beds are leveled to this loudness on their own (about 8 dB under the voice), then ducked further under speech.
const BED_LUFS = -24

function args(argv) {
  const out = { provider: 'elevenlabs', model: 'eleven_multilingual_v2', album: 'The Imaginal Act — Audio Companion', artist: 'Reality Architect', comment: 'Narration: synthesized voice (ElevenLabs). Music: original.' }
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '')
    if (key === 'dry' || key === 'keep') out[key] = true
    else out[key] = argv[++i]
  }
  // ffmpeg's concat lists resolve relative paths against the list file, so every path is made absolute here.
  for (const key of ['scripts', 'out', 'music', 'cover']) if (out[key]) out[key] = path.resolve(out[key])
  return out
}

function run(cmd, list, { capture = false } = {}) {
  const result = spawnSync(cmd, list, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.status !== 0) throw new Error(`${cmd} failed (${result.status}): ${(result.stderr || '').slice(-1500)}`)
  return capture ? `${result.stdout}${result.stderr}` : ''
}

function duration(file) {
  const out = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' })
  const seconds = Number(out.stdout.trim())
  if (!(seconds > 0)) throw new Error(`No duration for ${file}`)
  return seconds
}


async function elevenlabs(text, context, opts, file) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('Set ELEVENLABS_API_KEY (never commit it).')
  if (!opts.voice) throw new Error('Pass --voice <voice id>.')
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(opts.voice)}?output_format=mp3_44100_192`
  const body = {
    text,
    model_id: opts.model,
    voice_settings: { stability: 0.6, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true },
    previous_text: context.previous || undefined,
    next_text: context.next || undefined,
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, { method: 'POST', headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' }, body: JSON.stringify(body) })
    if (response.ok) {
      fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()))
      return
    }
    const detail = (await response.text()).slice(0, 300)
    if (response.status !== 429 && response.status < 500) throw new Error(`ElevenLabs ${response.status}: ${detail}`)
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt))
  }
  throw new Error('ElevenLabs kept failing; try again later.')
}

function sapi(text, file) {
  const textFile = `${file}.txt`
  fs.writeFileSync(textFile, text, 'utf8')
  // Paths travel as environment variables, so no file name is ever quoted inside the PowerShell command.
  const script = 'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = -1; $s.SetOutputToWaveFile($env:RA_WAV); $s.Speak([IO.File]::ReadAllText($env:RA_TEXT)); $s.Dispose()'
  const result = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', env: { ...process.env, RA_WAV: file, RA_TEXT: textFile } })
  if (result.status !== 0) throw new Error(`powershell failed: ${(result.stderr || '').slice(-800)}`)
  fs.rmSync(textFile)
}

/** Synthesizes (or reuses) one segment and returns a mono 44.1 kHz WAV path. */
async function segment(text, context, opts, cacheDir, stats) {
  const id = segmentKey(text, context, opts)
  const wav = path.join(cacheDir, `${id}.wav`)
  if (fs.existsSync(wav)) {
    stats.cached++
    return wav
  }
  const raw = path.join(cacheDir, `${id}.${opts.provider === 'sapi' ? 'raw.wav' : 'mp3'}`)
  if (opts.provider === 'sapi') sapi(text, raw)
  else await elevenlabs(text, context, opts, raw)
  stats.sent += text.length
  stats.synthesized++
  run('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-ac', '1', '-ar', String(RATE), wav])
  fs.rmSync(raw)
  return wav
}

function bedFor(musicDir, cue) {
  if (!musicDir) return null
  for (const ext of ['wav', 'flac', 'mp3', 'm4a']) {
    const file = path.join(musicDir, `${cue}.${ext}`)
    if (fs.existsSync(file)) return file
  }
  return null
}

const bedGains = new Map()
/** The fixed gain (dB) that brings a bed to BED_LUFS: measured once, no pumping. */
function bedGain(file) {
  if (!bedGains.has(file)) bedGains.set(file, BED_LUFS - Number(loudness(file).input_i))
  return bedGains.get(file)
}

function silence(seconds, dir) {
  const file = path.join(dir, `silence-${seconds.toFixed(3)}.wav`)
  if (!fs.existsSync(file)) run('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', `anullsrc=r=${RATE}:cl=mono`, '-t', seconds.toFixed(3), file])
  return file
}

function loudness(file) {
  const out = run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`, '-f', 'null', '-'], { capture: true })
  const json = out.slice(out.lastIndexOf('{'), out.lastIndexOf('}') + 1)
  return JSON.parse(json)
}

async function buildTrack(file, opts, dirs, report) {
  const { front, events } = parseScript(fs.readFileSync(file, 'utf8'))
  const number = String(front.track ?? path.basename(file).slice(0, 2))
  const title = String(front.title ?? path.basename(file, '.md'))
  const speech = events.filter((event) => event.type === 'speech')
  const entry = { file: path.basename(file), track: number, title, characters: voicedCharacters(events), segments: speech.length }
  if (opts.dry) {
    report.tracks.push(entry)
    return
  }
  const stats = { cached: 0, synthesized: 0, sent: 0 }
  const wavs = []
  for (let i = 0; i < speech.length; i++) {
    wavs.push(await segment(speech[i].text, { previous: speech[i - 1]?.text, next: speech[i + 1]?.text }, opts, dirs.cache, stats))
  }
  const plan = layout(events, wavs.map(duration), tailSeconds(front))

  // The voice track: speech and real silence, in order.
  const work = fs.mkdtempSync(path.join(dirs.work, `t${number}-`))
  const list = plan.voice.map((part) => concatLine(part.kind === 'speech' ? wavs[part.index] : silence(part.seconds, dirs.cache)))
  fs.writeFileSync(path.join(work, 'voice.txt'), list.join('\n'))
  const voice = path.join(work, 'voice.wav')
  const joined = path.join(work, 'voice-raw.wav')
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(work, 'voice.txt'), '-ac', '1', '-ar', String(RATE), joined])
  // Level the voice on its own first, so the beds sit a known distance under it.
  run('ffmpeg', ['-y', '-v', 'error', '-i', joined, '-af', `volume=${(TARGET.I - Number(loudness(joined).input_i)).toFixed(2)}dB`, '-ar', String(RATE), voice])

  // Music spans, each looped to length with its fades, laid at its start, ducked under the voice.
  const inputs = ['-i', voice]
  const filters = [`[0:a]aformat=sample_rates=${RATE}:channel_layouts=stereo,apad=whole_dur=${plan.total.toFixed(3)},asplit=2[v][vsc]`]
  const beds = []
  const missing = []
  for (const span of plan.spans) {
    const bed = bedFor(opts.music, span.cue)
    if (!bed) {
      missing.push(span.cue)
      continue
    }
    const index = 1 + beds.length
    inputs.push('-stream_loop', '-1', '-i', bed)
    const length = span.end - span.start
    const delay = Math.round(span.start * 1000)
    filters.push(`[${index}:a]aformat=sample_rates=${RATE}:channel_layouts=stereo,atrim=0:${length.toFixed(3)},asetpts=PTS-STARTPTS,volume=${bedGain(bed).toFixed(2)}dB,afade=t=in:st=0:d=${span.fadeIn},afade=t=out:st=${Math.max(0, length - span.fadeOut).toFixed(3)}:d=${span.fadeOut},adelay=${delay}|${delay}[m${beds.length}]`)
    beds.push(`[m${beds.length}]`)
  }
  let mix = '[v]'
  if (beds.length) {
    filters.push(`${beds.join('')}amix=inputs=${beds.length}:normalize=0:duration=longest,apad=whole_dur=${plan.total.toFixed(3)}[music]`)
    filters.push('[music][vsc]sidechaincompress=threshold=0.015:ratio=6:attack=20:release=800:makeup=1[duck]')
    filters.push('[v][duck]amix=inputs=2:normalize=0:duration=first[mixed]')
    mix = '[mixed]'
  } else filters.push('[vsc]anullsink')
  filters.push(`${mix}atrim=0:${plan.total.toFixed(3)}[out]`)
  const premix = path.join(work, 'premix.wav')
  run('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]', '-ar', String(RATE), premix])

  // Measured gain to the target, then a peak limiter. (loudnorm's own second pass turns dynamic when the range is
  // wide, which would pump the music-only intro and tail up toward the voice.)
  const measured = loudness(premix)
  const gain = TARGET.I - Number(measured.input_i)
  const norm = `volume=${gain.toFixed(2)}dB,alimiter=limit=${Math.pow(10, (TARGET.TP - 0.5) / 20).toFixed(4)}:attack=5:release=50:level=false`
  const slug = path.basename(file, '.md')
  const placeholder = opts.provider === 'sapi'
  const mp3 = path.join(dirs.out, `${slug}${placeholder ? '.PLACEHOLDER' : ''}.mp3`)
  const cover = opts.cover && fs.existsSync(opts.cover) ? ['-i', opts.cover, '-map', '0:a', '-map', '1:v', '-c:v', 'mjpeg', '-disposition:v', 'attached_pic'] : []
  run('ffmpeg', ['-y', '-v', 'error', '-i', premix, ...cover, '-af', norm, '-ar', String(RATE), '-c:a', 'libmp3lame', '-b:a', '192k', '-id3v2_version', '3',
    '-metadata', `title=${title}`, '-metadata', `artist=${opts.artist}`, '-metadata', `album=${opts.album}`, '-metadata', `track=${Number(number) + 1}`,
    '-metadata', `comment=${placeholder ? 'PLACEHOLDER VOICE — NOT FOR RELEASE. ' : ''}${opts.comment}`, '-metadata', 'genre=Spoken Word', mp3])
  const final = loudness(mp3)
  if (!opts.keep) fs.rmSync(work, { recursive: true, force: true })
  report.tracks.push({ ...entry, ...stats, mp3: path.basename(mp3), seconds: Number(duration(mp3).toFixed(2)), runtime: formatTime(duration(mp3)), lufs: Number(final.input_i), truePeak: Number(final.input_tp), missingBeds: [...new Set(missing)] })
  console.log(`${number} ${title}: ${formatTime(plan.total)}, ${final.input_i} LUFS, ${stats.synthesized} new / ${stats.cached} cached segments${missing.length ? `, no bed for ${[...new Set(missing)].join(', ')}` : ''}`)
}

function buildBook(report, dirs, opts) {
  const tracks = report.tracks.filter((track) => track.mp3)
  if (tracks.length < 2) return
  const list = tracks.map((track) => concatLine(path.join(dirs.out, track.mp3)))
  fs.writeFileSync(path.join(dirs.work, 'all.txt'), list.join('\n'))
  let at = 0
  const chapters = [';FFMETADATA1', `title=${opts.album}`, `artist=${opts.artist}`]
  for (const track of tracks) {
    const end = at + track.seconds * 1000
    chapters.push('[CHAPTER]', 'TIMEBASE=1/1000', `START=${Math.round(at)}`, `END=${Math.round(end)}`, `title=${track.title}`)
    at = end
  }
  fs.writeFileSync(path.join(dirs.work, 'chapters.txt'), chapters.join('\n'))
  const m4b = path.join(dirs.out, `${slugify(opts.album)}${opts.provider === 'sapi' ? '.PLACEHOLDER' : ''}.m4b`)
  run('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dirs.work, 'all.txt'), '-i', path.join(dirs.work, 'chapters.txt'), '-map_metadata', '1', '-map_chapters', '1', '-c:a', 'aac', '-b:a', '128k', '-f', 'mp4', m4b])
  report.m4b = path.basename(m4b)
}

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function main() {
  const opts = args(process.argv.slice(2))
  if (!opts.scripts || !opts.out) {
    console.error('Usage: node scripts/audio/build.mjs --scripts <dir> --out <dir> [--music <dir>] [--only NN] [--dry] [--provider elevenlabs|sapi] [--voice id]')
    process.exit(2)
  }
  const files = fs.readdirSync(opts.scripts).filter((name) => /^\d{2}-.*\.md$/.test(name) && (!opts.only || name.startsWith(opts.only))).sort().map((name) => path.join(opts.scripts, name))
  const dirs = { out: opts.out, cache: path.join(opts.out, '.cache'), work: path.join(opts.out, '.work') }
  for (const dir of Object.values(dirs)) fs.mkdirSync(dir, { recursive: true })
  const report = { builtAt: new Date().toISOString(), provider: opts.provider, model: opts.model, target: TARGET, dry: Boolean(opts.dry), tracks: [] }
  for (const file of files) await buildTrack(file, opts, dirs, report)
  if (!opts.dry && !opts.only) buildBook(report, dirs, opts)
  report.characters = report.tracks.reduce((total, track) => total + track.characters, 0)
  report.charactersSent = report.tracks.reduce((total, track) => total + (track.sent ?? 0), 0)
  report.runtime = formatTime(report.tracks.reduce((total, track) => total + (track.seconds ?? 0), 0))
  fs.writeFileSync(path.join(opts.out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (!opts.keep) fs.rmSync(dirs.work, { recursive: true, force: true })
  console.log(`${report.tracks.length} tracks, ${report.characters} voiced characters${opts.dry ? ' (dry run: nothing synthesized)' : `, ${report.runtime} total`}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
