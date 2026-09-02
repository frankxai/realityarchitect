# Conformance — reality.md v0.1

A standard that cannot be checked is a blog post. This document defines what "a valid reality.md" means, and
`bin/reality-md.mjs` decides it — same rules, no interpretation, zero dependencies.

```bash
node standard/bin/reality-md.mjs validate ~/reality.md
```

Exit code `0` at level 2 or higher, `1` below it, `2` on a usage error. `--strict` demands level 4.
Nothing is uploaded; the CLI has no network code.

---

## The four levels

Levels are cumulative and checked in order. A file cannot reach a level while an earlier level has an error.

| Level | Name | The claim it earns you |
|-------|------|------------------------|
| **1** | Parseable | A machine can read the file and know it is a reality.md. |
| **2** | Structural | Every canonical section is present. Empty is allowed; absent is not. |
| **3** | Operative | An agent can act: there is an identity, an aim with a done-when, a guardrail, and a review. |
| **4** | Portable | Every claim is evaluable, and the packet survives a round trip through another harness. |

Level 2 is the bar for calling a file conformant. Level 3 is the bar for letting an agent act on it unsupervised.
Level 4 is the bar for handing the packet to a tool you did not write.

**An empty section is never an error.** It is a declared gap, and the validator reports it as one — under
`counts.unmetMoves` and as a `SystemGap` node in the graph. A tool that punished you for an honest blank would
teach you to fill it with nothing.

---

## Findings

Every finding carries a stable code. Codes do not change meaning within a major version.

### Level 1 — Parseable

| Code | Fails when |
|------|-----------|
| `FM_MISSING` | No YAML frontmatter. |
| `FM_STANDARD` | Frontmatter does not declare `standard: reality.md`. |
| `FM_VERSION_MISSING` | No `version`. |
| `FM_VERSION_SHAPE` | `version` is not `MAJOR.MINOR`. |
| `FM_VERSION_UNSUPPORTED` | A version this validator does not implement. Run `reality-md migrate`. |
| `TITLE_MISSING` | No H1 naming the subject (`# reality.md — <name>`). |

### Level 2 — Structural

| Code | Fails when |
|------|-----------|
| `SECTION_MISSING` | One of the nine canonical headings is absent. |

### Level 3 — Operative

| Code | Fails when |
|------|-----------|
| `NO_IDENTITY` | Identity has no entries — PROPOSE has no identity to vote for. |
| `NO_AIM` | Aims has no entries — SURFACE has nothing to filter against. |
| `AIM_NO_DONE_WHEN` | An aim has no `done when …` — nobody, human or agent, can evaluate it. |
| `AIM_PLACEHOLDER` | An aim is still the template's `<placeholder>` text — an agent acting on it would invent your intent. |
| `NO_GUARDRAIL` | Guardrails is empty — GUARD has nothing to enforce. |
| `NO_FEEDBACK` | Feedback is empty — nothing closes the loop and the file goes stale. |
| `NO_PROTOCOL` | Agent protocol is empty — the file is a note, not a contract. |

### Level 4 — Portable

| Code | Fails when |
|------|-----------|
| `AIM_NO_DEADLINE` | An aim has no `by YYYY-MM-DD` — a scheduled agent cannot report on it. |
| `NO_TRIGGER` | No `if …, then …` anywhere — intentions without triggers do not survive a normal week. |
| `NODE_FACET_MISSING` | A derived node lacks owner, version, or visibility. |
| `NODE_NOT_EVALUABLE` | A derived node has no evaluation rule. |
| `TOO_LONG` | Over 150 lines — depth belongs in `.reality/`, not in the contract. |

### Warnings (never gate a level)

| Code | Means |
|------|-------|
| `SECTION_UNKNOWN` | A heading outside the canonical nine; its content is ignored, not migrated. |
| `FM_UPDATED_SHAPE` | `updated` is not an ISO date. |
| `PLACEHOLDER_LINES` | Lines still carry `<placeholder>`, `…`, `TBD` or `TODO`. Delete what you have not decided — an empty section is honest; a filled-in placeholder is not. Use HTML comments for prompts you want to keep: the parser strips them. |
| `PRIVACY_SECRET` | The file looks like it contains a credential. reality.md is private, but credentials belong in a secret store — this file gets pasted into agent context by design. |

---

## Portability

A conformant packet projects into every harness from one source. The CLI emits all of them:

```bash
node standard/bin/reality-md.mjs emit ~/reality.md --target claude
```

| Target | File | Form |
|--------|------|------|
| `reality.md` | `reality.md` | canonical markdown (round-trip form) |
| `claude` | `CLAUDE.md` | markdown block |
| `codex` | `AGENTS.md` | markdown block |
| `cursor` | `.cursorrules` | markdown block |
| `gemini` | `GEMINI.md` | markdown block |
| `hermes` | `hermes.context.json` | JSON context |

Every emission carries the same **digest** — an FNV-1a hash over the semantic payload (kind, label, evaluation
rule of every node). Portability is therefore falsifiable, not asserted:

- `digest(parse(emit(packet, 'reality.md'))) === digest(packet)` — the canonical form round-trips.
- All six emissions declare the same digest, so a stale generated file is detectable by comparing one line.

Generated files carry `generated, do not hand-edit` and the command that regenerates them. The source of truth is
always `~/reality.md`; the projections are disposable.

## What conformance does *not* claim

It does not judge whether your aims are good, whether your systems work, or whether your file is true. It checks
that every statement in it is the kind of statement something could check. That is the whole job of a standard.
