# Versioning — reality.md

The point of a standard is that a file written today still parses in five years, on a harness that does not exist
yet. That promise is worth more than any feature, so the rules below are deliberately restrictive.

## The version line

```yaml
---
standard: reality.md
version: "0.1"
updated: 2026-09-02
---
```

`version` is `MAJOR.MINOR`. It describes the **standard the file was written against**, not the tool that read it.
A validator states which versions it implements (`SUPPORTED_VERSIONS`) and refuses the rest with
`FM_VERSION_UNSUPPORTED` rather than guessing.

## What each bump means

| Bump | Means | A conformant file from the old version |
|------|-------|----------------------------------------|
| **MINOR** (0.1 → 0.2) | Additive only: new optional sections, new node kinds, new relations, new findings at an existing level. | Still valid. Still parses. Never rewritten. |
| **MAJOR** (0.x → 1.0) | Removal or redefinition: a section renamed or dropped, a required field added, a finding promoted to a lower level. | Requires a migration, shipped in `src/migrate.mjs` with fixtures. |

Concretely, these are **minor** changes: adding a tenth section, adding an `Artifact` relation, adding a warning
code, tightening a message. These are **major**: renaming `Aims`, requiring a deadline at level 3, changing what
`private` means.

## Rules the maintainers hold themselves to

1. **No silent semantics.** A finding code never changes meaning inside a major version. Retire a code, do not
   repurpose it.
2. **Every major version ships a migration** in `src/migrate.mjs`, a fixture in `fixtures/`, and a test that
   asserts the migrated file reaches level 2. A migration that cannot be executed is not a migration.
3. **Migrations never invent content.** They rename, reorder, and leave absent sections visibly empty — because an
   empty section is the human's gap, and a tool that hides it is lying on the human's behalf.
4. **The last two majors keep parsing.** A validator drops support for a major version only one major after it was
   superseded, and says so in `SUPPORTED_VERSIONS`.
5. **The schema and the implementation are checked against each other** (`test/schema.test.mjs`). They cannot drift
   by accident.
6. **The name stays generic.** `reality.md` is not a product name. Standards outlive their authors only if nobody
   has to ask permission to implement one.

## Consuming the standard from another product

The versioned interface is `standard/src/index.mjs` with types in `standard/src/index.d.mts`. Import the module,
not the internals: `parse.mjs`, `graph.mjs`, `validate.mjs`, `emit.mjs`, and `migrate.mjs` may be reorganised in a
minor release; the index export list may not.

```js
import { readRealityMd, emit, nextArtifactBrief, VERSION } from './standard/src/index.mjs'

const { packet, conformance } = readRealityMd(text)
if (conformance.level < 2) { /* refuse to act on a non-conformant file */ }
```

A downstream product should:

- **Pin the version it implements** and refuse packets above it, rather than best-effort parsing an unknown shape.
- **Preserve `visibility`.** A `private` node must not be transmitted, logged to a shared store, or embedded in a
  prompt sent to a service the human did not name.
- **Preserve `provenance`.** A node with `method: "inferred"` was produced by a tool and must never be shown back
  to the human as their own words.
- **Never write `~/reality.md` unasked.** The human owns the contract; agents own `~/.reality/`. This is a rule of
  the standard, not a preference of the implementation.

## Status of v0.1

v0.1 is the first published version and is expected to receive minor additions before 1.0. The eight sections, the
five verbs, and the four conformance levels are stable and will not change without a major bump. `Decision`,
`Evidence`, and `Revision` nodes are defined in the schema but are currently produced from `.reality/` and from
migrations rather than from `reality.md` itself; wiring them to the file is the most likely 0.2 addition.
