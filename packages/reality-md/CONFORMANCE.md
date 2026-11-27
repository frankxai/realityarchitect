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

**A gap is read from the graph, never from an empty section.** Each move of the Loop has an evidence predicate
over derived nodes — Automate, for instance, is evidenced by a changed default *or* by a system whose own
description says it runs on a schedule. So an operator with a blank `## Environment` and a nightly unattended
loop under `## Systems` has automated something, and the tool says so. Gaps are phrased as *no evidence of X in
this file*, because that is the only thing a file can tell you.

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

## The shape of an aim

An aim is the one line in the file an agent has to be able to evaluate, so its shape is normative.
Three facets: a **label**, a **done-when**, and a **deadline** (`by YYYY-MM-DD`, required at level 4).

**Canonical form — everything on the aim's own line.** Emit this if you are writing a generator:

```markdown
- **Vendor review automated** — done when the monthly review runs unattended, by 2026-11-01. → `.reality/aims/vendor-review.md`
```

**Accepted alternate — the facets on an immediately nested sub-bullet.** A generator projecting from a
typed graph naturally produces this, so the parser absorbs the sub-bullet into the aim above it:

```markdown
- Vendor review automated
  - done when the monthly review runs unattended, by 2026-11-01
```

Rules a downstream emitter must follow:

- Both forms build the **identical `Goal` node** — same `detail.doneWhen`, `detail.deadline`, `evaluation.rule`
  and therefore the same digest. `test/conformance.test.mjs` asserts that equivalence.
- **First writer wins.** A facet already found on the aim line is never overwritten by a sub-bullet.
- Only **immediately nested** bullets are absorbed, and only those carrying at least one facet
  (`done when …`, `by YYYY-MM-DD`, or a `` `.reality/aims/…` `` path). A nested bullet with none of them is left
  alone — it is a note, not a continuation. A nested `if …, then …` is always a trigger, never a continuation.
- The bold label is optional; a plain `- <label>` is fine. Everything before the first ` — ` is the label.

---

## Portability

A conformant packet projects into every harness from one source. The CLI emits all of them:

```bash
node standard/bin/reality-md.mjs emit ~/reality.md --target claude --write ~/CLAUDE.md
node standard/bin/reality-md.mjs verify ~/CLAUDE.md
```

Targets differ by **harness convention**, not by filename. A harness that resolves file imports gets a
pointer, because a pointer cannot go stale; one that does not gets a verbatim snapshot that `verify` re-parses.

| Target | File | Mode | Why |
|--------|------|------|-----|
| `reality.md` | `reality.md` | canonical | the round-trip form |
| `claude` | `CLAUDE.md` | import | Claude Code resolves `@path` imports in CLAUDE.md |
| `gemini` | `GEMINI.md` | import | the Gemini CLI resolves `@path` imports in GEMINI.md |
| `codex` | `AGENTS.md` | snapshot | AGENTS.md has no import mechanism |
| `cursor` | `.cursor/rules/reality.mdc` | snapshot | current Cursor rules format, with MDC frontmatter |
| `cursor-legacy` | `.cursorrules` | snapshot | deprecated by Cursor; kept only to regenerate an existing file |
| `hermes` | `hermes.context.json` | json | JSON context, with the canonical markdown embedded |

`--write` owns exactly the block between `<!-- reality.md:start -->` and `<!-- reality.md:end -->`. An existing
file keeps everything outside those markers; a file with no markers gets the block appended. Re-writing the same
block twice changes nothing.

Every emission carries the same **digest** — an FNV-1a hash over the semantic payload (kind, label, evaluation
rule of every node). Portability is falsifiable, and the witness never compares a value with itself:

```bash
reality-md verify AGENTS.md              # re-parses the embedded contract
reality-md verify CLAUDE.md              # re-parses the file the import points at
reality-md verify CLAUDE.md --source ./reality.md
```

`verify` re-derives a packet from what the projection actually contains and compares that with the digest the
projection declares. Exit `0` on match, `1` on drift. Generated files carry `generated, do not hand-edit` and the
command that regenerates them. The source of truth is always `~/reality.md`; the projections are disposable.

## What conformance does *not* claim

It does not judge whether your aims are good, whether your systems work, or whether your file is true. It checks
that every statement in it is the kind of statement something could check. That is the whole job of a standard.
