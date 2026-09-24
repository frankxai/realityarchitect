# Reality Architect — experience architecture (proposal)
Status: design proposal, September 2026. Built on SIP. This extends the [Architect's Loop](../README.md) and [reality.md standard](../standard/README.md). Keep the method open and the user's private life under their control.

## Product promise
A person enters with an unfinished future and leaves with one authored reality, one buildable system, and proof that they acted. The product helps them see a life they want to inhabit, locate the present constraint, produce the next artifact, and revise from evidence. A compelling scene opens attention; consented memory and repeated action sustain change.

The first experience should be useful in one sitting and become more valuable over four weeks. No claim that visualization, frequencies, quantum mechanics, or AI can directly cause external outcomes.

## One route through three rooms

### 1. Threshold — 8 minutes
Prompt: “What would an ordinary Tuesday look like when this part of your life works?”
- Choose one domain from twelve life areas; offer examples without storing an answer yet.
- Write or dictate a concrete future scene in first person: place, body, work, people, and how the day ends. Invite one small, honest pleasure already available.
- Show a visual scene or optional soundscape as user-selected atmosphere. AI may propose a draft, but the user edits and owns the wording.
- Contrast with one present fact, one inner obstacle, another person's agency, and one boundary.
- Exit artifact: a local `Reality Card` containing authored scene, present fact, if-then plan, first act, time, and evidence criterion.

### 2. Atlas — 20 minutes or an optional four-week journey
- Twelve domains are coverage, not twelve simultaneous priorities. A person authors one priority now and can later map the whole life.
- Every domain page contains premise, vision, purpose, architecture, evidence, and counterevidence. Support a visual “normal day” and a text-only equivalent.
- A `Reality Diff` shows current facts, desired state, skills, environments, social conditions, financial limits, and who controls what.
- Allow separate layers: personal belief, tested practice, observed result. Inference must be tagged and correctable.
- Export user-authored `reality.md` changes as a diff, never overwrite automatically. Sensitive domain data stays private.

### 3. Studio — return daily for 4 to 12 minutes
- Regulate: comfortable optional grounding, with a skip route. Receive: one actual fact and receipt.
- Render: return to a chosen scene and rehearse the obstacle. Record: one action, deadline, and proof.
- A 60-second return path lets the user continue when tired.
- Weekly Illumination compares intended and observed, celebrates a lived beautiful moment, checks any repair owed, and proposes one revision. The evidence ledger records events with provenance; it does not score human worth.
- The next move follows See → Design → Build → Automate → Compound. Automation begins only after a manual loop demonstrates value.

## Experience grammar
- **Visual:** editorial humanity, architectural scale, tactility, natural light, negative space. Place the person and their act before the intelligence system. Images are optional and user-approved; never infer the appearance of their family or partner.
- **Language:** evocative opening followed by a concrete question and action. Example: “A different Tuesday starts here. What changes first?” Then “What will you do by Friday, and what will prove it happened?”
- **Sound:** an optional original composition with user-controlled volume and silence. Do not label tones as healing, DNA repair, or neural entrainment without appropriate evidence.
- **Movement:** the interface changes in response to an authored decision: scene → contrast → artifact. All paths work with reduced motion, keyboard, screen reader, low bandwidth, and no sound.
- **Agency:** no prediction of relationship outcomes, no manufactured urgency, no “success probability” from personal writing, and no default sharing.

## Product topology
| Layer | Initial implementation | Extension gate |
| --- | --- | --- |
| Public entry | Existing Next.js site; a distinct route linked from /start and /method | Measure completed Reality Cards, not traffic alone |
| Private first session | Client-only state and Markdown export; no account required | Optional encrypted sync after users ask for continuity |
| AI composition | Optional server call for scene alternatives and obstacle questions; schema-validated output, user edits | Metered multi-session memory after retention proof |
| Evidence | Append-only dated events with evidence class and source; local export | User-controlled sync, provenance and corrections |
| Portability | `reality.md` contract plus a small structured packet; clear export/delete | Cross-agent MCP read/propose/log interface |
| Media | Static approved art and original sound with text equivalent | Personal visuals only after explicit opt-in |
| Community | Shared general exercises, never automatic publication of personal cards | Group cohorts after solo completion and consent |
| Commerce | Free first meaningful artifact | Price only after value, license, delivery and refund are real |

An optional hosted state later uses account-scoped authorization, encryption at rest, explicit retention, access logs, and deletion/export controls. Keep a personal/private data boundary even when the public method is open. Human-only authority covers vows, relationships, health decisions, purchases, messaging and sharing.

## One machine-readable object
```ts
type RealityCard = {
  id: string
  version: 1
  domain: string
  authoredScene: string
  presentFact: string
  innerObstacle: string
  ifThen: { trigger: string; response: string }
  nextAct: { description: string; dueAt?: string; proof: string }
  agencyBoundary?: string
  claimTags: ('observed' | 'inferred' | 'desired' | 'spiritual')[] 
  consent: { aiUse: boolean; cloudSync: boolean; share: boolean }
}
```
The initial implementation may serialize locally to Markdown. Do not put identifiable private cards in telemetry, server logs, GitHub issues, or prompt evaluation datasets. An AI suggestion must be distinguishable from user-authored text.

## Release sequence
1. **First artifact:** build Threshold as a small local-first path. Acceptance: a stranger can finish without account, edit every sentence, export the card, and identify one observable next move in under ten minutes. Test keyboard and mobile.
2. **Return loop:** add Studio with local dated entries and weekly reflection. Acceptance: a user can return after a missed day without streak punishment and compare a plan with an actual result.
3. **Whole-life atlas:** open twelve domains after the first action. Acceptance: priority selection produces no pressure to populate every category; data exports cleanly.
4. **Optional AI and sync:** add only when completion, return use, marginal inference value, cost, and consent are measured. AI never activates a vow or sends a message.
5. **Cohort and commerce:** test a bounded 30-day challenge after the solo practice yields repeat use. A paid offer must specify deliverable, price, access, and refund.

## Existing work and integration
- `/assess` already exports an architecture brief about AI-system dependencies. Keep it as the technical entry. Threshold is the life/vision entry; both converge on one Reality Card and one next build.
- Draft PR [#22](https://github.com/frankxai/realityarchitect/pull/22) includes `/jump` and a large Quantum Jump studio and is currently unmergeable. Reuse only design elements that survive review. Its scripts include unsupported health, frequency, and outcome claims and long predetermined identity narratives. Replace such claims with user-authored scenes, explicit metaphor labels, a comfortable skip route, and inspectable action.
- Do not import any founder-private Soulbook content into the public app, tests, seed data, marketing, or issue descriptions.

## Decision gate
Before coding a hosted program, record: first-session completion, export rate, seven-day return, evidence events created, user-reported clarity, and one qualitative example of a changed action. A beautiful session without a voluntarily chosen next act is an incomplete experience.
