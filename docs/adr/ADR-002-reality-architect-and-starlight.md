# ADR-002: Reality Architect and Starlight, a standalone practice on a shared kernel

- **Status:** accepted 2026-10-06, under Frank's delegation. Phase 1 is implemented in the same pull request.
- **Question:** Frank asked:

  > How should Reality Architect look and work together with the Starlight Intelligence repositories, or does it work
  > all on its own? What is philosophy and what is actual engineering, how is it implemented, why will the community
  > love it, and does it even make sense?

## 1. The problems, first

People who try to design their lives with today's tools hit five failures. Each one is a reason this product should
exist, and each one sets a requirement.

| # | Problem | What it costs | Requirement |
| --- | --- | --- | --- |
| 1 | **Fragmentation.** The vision lives in a notebook, tasks in Todoist, time in a calendar, the diary in Day One, and the AI chats forget. Nothing connects intent → action → evidence. | Plans that never meet the week; no way to see whether it is working. | One model of a life, read by every tool and agent. |
| 2 | **Hindsight and confirmation bias.** People remember the hits and forget the misses, and manifestation culture amplifies this. | A story that flatters instead of a record that teaches. | An honest, timestamped record that counts misses with hits. |
| 3 | **Context-less AI.** Every agent meets you as a stranger. | Generic advice, repeated onboarding, no continuity. | Portable, consented self-context that any agent can read. |
| 4 | **Lock-in and surveillance.** Life data sits in someone's cloud, often training their models. | Fear, then shallow use. | Local-first files the person owns; end-to-end encryption when they sync. |
| 5 | **Hype and blame.** Causal claims ("your frequency attracts it") and promises, and people blamed when nothing changes. | Harm, distrust, churn. | Two labeled registers, no causal claims, enforced in code. |

## 2. Decision

1. **Reality Architect stands on its own.** The format (`reality.md`, `soul.md`, `reality/`), the engine, the Studio,
   the plugin, the CLI and the MCP server need nothing from Starlight. They have no dependencies and work offline.
2. **It is a Starlight vertical by contract, not by code.** The engine emits Starlight Reality Architecture kernel
   v0.1.1 documents through a pure projection (`plugins/reality-architect/engine/kernel.mjs`).
   - The output is validated against SIS's own schemas, vendored and pinned by sha256
     (`engine/vendor/sis/SOURCE.md`).
   - SIS #280 registers the vertical and proposes the registry types `life_domain`, `practice` and `witness_entry`.
3. **Starlight is the optional substrate.** It is there for people who run more than one agent or work with a guide.
   It adds:
   - memory across agents (SIS MCP);
   - signed records (DSSE);
   - audience-safe projections (the SIP visibility lattice, rules P1–P5);
   - the estate graph.
4. **Dependencies point one way.**
   - Reality Architect depends on the kernel *contract*, never on SIS *runtime code*.
   - SIS never imports Reality Architect code.
   - Contracts move by versioned schemas, never by shared packages.

```
 person's files (Studio export · Obsidian vault · ~/.reality)          ── works alone, offline ──
            │ parse.mjs
            ▼
       reality (typed) ──► graph.mjs ──► Studio map · board · timeline · agent briefs · insights
            │
            └──► kernel.mjs ──► checkKernel (SIS schemas + references + the ADR-000 rule)
                                   │
                    ┌──────────────┼──────────────────┬───────────────────────┐
                    ▼              ▼                  ▼                       ▼
            `reality kernel`  MCP reality_kernel  a guide's view          the person's own SIS
              (CLI, JSON)      (any agent)      (audience: alliance)    (memory, attestation; optional)
```

### Why not merge into SIS, and why not ignore it

| Option | Why not |
| --- | --- |
| **Merge Reality Architect into SIS** | SIS is a substrate for a fleet of agents ("one shared brain for your whole AI fleet"); a person practising their life should not install a fleet OS. The registers differ (contemplative and personal vs operator), and so do the release cadences and the audiences. |
| **Ignore SIS** | Reality Architect would reinvent the graph, evidence, attestation and projection rules, and lose memory across agents. Worse, it would invent a second schema for exactly what SIS ADR-000 already names: "RealityDiff — Product artifact for Reality Architect". |
| **Contract-only coupling (chosen)** | Each ships on its own schedule while they share one meaning. SIS's rule "never encode desired outcomes as `existence.realm = real` without an ActualizationReceipt" is this practice's honesty rule. One rule now holds across both, and a test checks it. |

## 3. Philosophy versus engineering

This split is how the product stays both meaningful and honest.

| Concept | Philosophy (Meaning: taught, never computed as cause) | Engineering (Mechanism: built and tested) | Where it is checked |
| --- | --- | --- | --- |
| Reality Theory, the One Law | A teaching frame: attention → belief → action → environment → feedback → outcome | No computation. The claims gate forbids causal claims on every public surface. | `scripts/check-public-claims.mjs` |
| The scene, "living from the end" | A contemplative practice, in the person's words | Stored as `desired` text. In the kernel it is only ever a `FutureBranch` with `epistemics: desired`, never an object or a fact. | `tests/kernel.test.mjs` ("desired things stay desired") |
| "I am" lines, soul | Identity, meaning | `soul.md`, private. Never in a guide's view. | the kernel leak test |
| Signs and synchronicity | Personal meaning | Witness entries with primed/unprimed. Look-fors are counted with their misses. The output is counts, never causes. | `engine/insights.mjs`, studio-patterns parity |
| "Is it enough?" | A coaching question | Deterministic pace from planned versus logged reps and overdue moves | `engine/pace.mjs` |
| Evidence of what happened | The wish for proof | An evidence ledger: timestamped, misses counted, receipts that say plainly "self-reported, nothing independent verified it". Next: signed sealed snapshots. | kernel receipts; Phase 2 |
| Reality across time | Seeing your life change | Approved immutable snapshots (`world_state`, `canonical`), diffs and decisions with review dates | snapshot and kernel tests |
| A coach who helps | Trust | The `alliance` audience: structure and counts only, by consent. Later, revocable SIP projections. | the kernel leak test; Phase 3 |
| Agents that know you | Being met, not processed | `reality.md` plus the Agent Charter. Read-only MCP tools (now nine), a CLI, skills that ask before writing. | `tests/mcp.test.mjs`, `tests/engine.test.mjs` |

## 4. Implemented in this PR (Phase 1)

| Reality Architect | Kernel primitive | Honesty rule in the mapping |
| --- | --- | --- |
| The person; an Atlas domain (scores, reported fact) | `RealityObject` (`person`, `life_domain`) | Self-reported: `status: asserted`, `source_type: human` |
| An aim | `RealityObject` (`goal`) | `realm: planned` and `kind: preference` while active. It becomes `realm: real` only when the person reports it achieved, and then it carries the receipt as evidence. |
| The scene of an aim or a domain | `FutureBranch` | Always `epistemics.kind: desired`. The verification criterion is the done-when, `evidence_type: self_report`. |
| Obstacle, pace and done-when | `RealityDiff` gaps (`gapClass` from the aim; pace as `time`) | `method: reality-architect-engine/pace, deterministic`. "A count is never a cause." |
| Reps, bold moves, the done-when review | `ActualizationPlan` actions | `owner: human` (the person), `governance_tier: human_gate` |
| A logged rep, a done move, an achieved aim | `ActualizationReceipt` | `verification.status: unverifiable`, with notes "Self-reported…". Rep receipts carry a content hash of the entry. |
| Witness entries; the day's look-for | `RealityEvent` (`witness.<kind>`, `lookfor.result`) | Facts are `reported`, meaning is `meaning`; local times carry an explicit offset, never a fake `Z` |
| Sealed snapshots, decisions | `RealityObject` (`world_state` `canonical`, `decision`) | Only approved snapshots are `canonical` |

- **Audiences.**
  - `private` is everything, for the person.
  - `alliance` is a guide's view. It includes:
    - the aims, done-whens, reps and moves, exactly as the person titled them (anything written in a title is shared as written);
    - dates, statuses and pace;
    - witness kinds and look-for results, misses included.

    It never includes meaning, scenes, facts or obstacles in the person's words, the people and places they listed, skills, systems, decisions or soul. Witness IDs use ordinals, not hashes of private text, and receipts carry no content hashes, so a guide cannot test guesses against them.
  - There is no default audience. The CLI requires `--audience` and refuses bad or unknown flags; the MCP tool requires `audience` and checks it before reading any file.
  - Public sharing stays with the Reality Card.
- **Checks.**
  - `checkKernel` validates every document against the vendored SIS schemas.
  - It verifies every reference: relations, evidence, branches, diffs, plans, actions, events and subjects.
  - It enforces SIS ADR-000's rules directly:
    - An aim is never recorded as real without a receipt, and that evidence must be a receipt in the bundle.
    - Every relation stated by a real object carries `evidence_ids`. These are the person's source files (for example `reality/aims/x.md`), not other bundle documents. The check requires them to be present; it cannot vouch for what the files say.
  - Aim IDs stay unique even when names leave nothing of the ID alphabet (Cyrillic, CJK) or collapse to the same key. Such an aim gets a short hash of its own slug. The title is already visible to a guide, so the hash reveals nothing new.
- **Surfaces.**
  - CLI: `reality kernel --audience private|alliance [--offset +HH:MM] [--check]`
  - MCP: `reality_kernel`, read-only, parity-tested against the CLI
- **Tests** (`tests/kernel.test.mjs`, 11):
  - the pinned bytes and strict schemas;
  - conformance in both audiences;
  - desired stays desired;
  - `owns` reads from the person to the aim;
  - receipts for reps, moves and achievement, dated by the files. A rep entry is filed under the aim's only rep, or under the rep it names, or else under "A rep not matched to a listed rep". It is never guessed onto a listed rep.
  - Exporting the Studio's own rep link into `witness.md` would make this exact for aims with several reps. That is a format change for STATE.md, proposed next.
  - look-for results keep their misses;
  - edge inputs: a double-logged rep, an aim named by its Obsidian file, umlauts and long names, short entries;
  - **canaries in every private field never reach a guide**, including short ones, fingerprints and hashes, plus an allowlist of guide payload keys;
  - determinism and honest offsets;
  - the checker catching a fake fact, a fake receipt, a broken reference and a schema violation;
  - the CLI refusing to fall back to the private view.
- **Independent review.** A fresh-context reviewer found three critical and six important issues in the first cut:
  - look-for misses read as "not marked";
  - duplicate IDs;
  - slugs that broke the schema;
  - a CLI that fell back to the private view;
  - skills and systems shared with a guide;
  - guessable hashes;
  - reversed `owns`;
  - receipts dated by the export day;
  - a weak leak test.

  All are fixed, each with a test.

## 5. Next phases

| Phase | What | Why it matters | Depends on |
| --- | --- | --- | --- |
| 2 | **Signed sealed snapshots.** A DSSE envelope (Ed25519) over the snapshot's canonical JSON, with the key held by the person: a local key file the plugin creates outside the `reality/` folder, or a non-extractable WebCrypto key in the browser (the local key design is #76; the browser key comes later; ADR-001 is superseded by ADR-003). Verified with SIS's `protocol/lib/dsse.mjs` shape. | A record the person cannot quietly rewrite later. This is the honest answer to "evidence": tamper-evident, misses included. | None (ADR-003) |
| 3 | **A SIP graph profile for the Guide Kit (ADR-003).** Projection nodes, visibility `alliance`, rules P1–P5 checked with SIS `conform.mjs` in CI, revocation stops future bundles (a file already sent cannot be recalled). | A coach sees exactly what was consented to, and a redaction is declared, never silent. | Phase 2; the Guide Kit |
| 4 | **Opt-in sink into the person's own SIS.** Push the private projection to their SIS memory (local MCP), for people who run Starlight. | Every agent in their fleet knows their reality, with receipts. | — |
| 5 | **Registry v0.1.2.** After SIS #280 merges, use `practice` and `witness_entry` directly instead of `capability` and `event`. | Exact semantics, fewer notes. | SIS #280 (Frank) |
| 6 | **Upstream the validator.** A small SIS PR adding `minLength`, `minimum` and `maximum` to `protocol/lib/jsonschema.mjs`. | SIS can then validate its own kernel without Python. | — |

## 6. Why the community will love it, and whether it makes sense

**Why they will love it:**

- **It works today, in their own files**, offline, on desktop and phone (Obsidian).
- **Every agent understands them.** One open format, with a plugin and MCP for Claude and others, so they stop
  onboarding every assistant.
- **A guide can help without reading their diary.** Consent is built into the data model, not added as a setting.
- **A record that cannot flatter them.** Misses are counted, receipts are honest, and sealed history is tamper-evident
  in Phase 2.
- **No hype, no promises,** in a category built on both. That is exactly what makes coaches and serious practitioners
  able to recommend it.
- **Builders can extend it:** the MIT standard, the engine, the kernel contract, and the marketplace bar
  (`skill-check`).

**Does it make sense?** Yes, with four honest caveats:

- **Most people will never see the kernel.** It is plumbing for agents, guides and builders. The interface stays
  simple: "Share with a guide" and "Connect to Starlight" are the only visible traces.
- **Two vocabularies, Reality Architect words and kernel words.** The mapping table above and the conformance tests
  keep them aligned. Upstream changes arrive only as deliberate, hash-pinned updates.
- **Self-reported evidence is not verified evidence.** Every receipt says so. Signing (Phase 2) proves *when* something
  was recorded and that it was not altered. It does not prove the event happened.
- **The moat is adoption, not the projection.** The projection only compounds when other agents and tools read it. That
  is why the public MCP connector and the directory listing (handover M2) come next.
