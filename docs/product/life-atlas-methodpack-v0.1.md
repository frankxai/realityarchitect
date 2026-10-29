# Life Atlas Edition and Expert MethodPack — product contract v0.1

Status: **implementation candidate on review branch; not a live expert marketplace**.
Owner: Reality Architect for the person-facing experience; Starlight Intelligence for the evidence/agent substrate.
Registry authority: `frankxai/agentic-ops/registry` (reviewed main); Design authority: `frankxai/starlight-design-intelligence`.

## Decision

Do not create a second consumer Life Atlas SaaS, and do not import a cosmic marketing mock into the Reality Architect product.
The existing Studio is the canonical personal experience: Imagine → Build → Witness, twelve life domains, `reality.md`,
`soul.md`, snapshots and explicit export. The Edition is a *read-only, downloadable editorial projection* of that
client-owned state, implemented without an AI call or backend.

Visual contract: graphite and blueprint blue for reported facts/mechanism; dawn serif for a person's authored meaning.
Starlight Intelligence retains its own calm institutional/protocol visual identity. GenCreator produces distinct editorial
skins under licensed design packs; shared quality gates do not imply shared brand styling.

## Delivery boundaries

| System | Owns | Must not become |
| --- | --- | --- |
| `realityarchitect` | Personal practice, editable Atlas, authored meaning, local-first versioned Edition | Cloud biometric repository or unconsented inference |
| Starlight Intelligence Systems | MethodPack specification, claim/evidence provenance, expert reviewer policy, reusable agent workflows | Consumer identity or proprietary practitioner IP |
| GenCreator | Licensed visual edition templates, accessible PDF/book/infographic generation, asset lineage | Source of personal truth or scientific validity |
| FrankX | Reviewed research synthesis, editorial discovery, invitations and education | Substitute for peer review |
| Academy | Practitioner training and competency evaluation | Certification without assessment |
| Arcanea | Optional fictional-world metaphor/creative scene rendering, explicitly fictional | Psychological diagnosis or a source for scientific claims |
| Registry / Product Operations | Owner map, release policy, acceptance evidence | Copy of private personal data |

## Edition v1 acceptance

- One explicit Download action, populated from the current `StudioState` only.
- All 12 canonical domains in stable order; missing ratings remain `not rated`.
- Facts, meaning, desires, plans, and completed actions are distinguished.
- No text or personal state sent to network/analytics; generated file exists only after explicit action.
- No AI-generated diagnosis, fingerprint inference, causal promise, invented percentile or synthetic citation.
- Fictional sample data carries an unmistakable sample watermark.
- Stable portable Markdown; existing full Studio export remains intact; no migration required.
- Keyboard-reachable CTA; no motion needed; tested with claims gate, unit tests and production build.
- No public marketing CTA for a not-yet-deliverable paid product.

## MethodPack v0.1 (proposed future Starlight contract)

```yaml
id: org.author.method.slug
version: 0.1.0
author: { display_name: "", legal_entity: "", consent_contact: "" }
license: { method: "", training_use: false, commercial_use: false }
claimed_outcomes: []
assessment:
  epistemic_class: reflective # reflective | measured | validated
  target_population: ""
  counterexamples: []
  contraindications: []
research:
  sources: []
  protocol_url: null
  preregistration: null
  independent_review: pending
privacy:
  raw_biometrics: forbidden_in_starlight_platform
  personal_data: owner_controlled
  export: mandatory
commerce:
  listing_state: draft
  sale_authorized: false
  royalty_terms: pending
```

A practitioner may publish an exploratory symbolic lens without promoting it to validated science. Claims about medical
diagnosis, lifespan, fingerprint-derived psychological traits, and risk prediction require independent domain-specific
evidence and regulatory/legal review; until then they are excluded from report recommendations. Client data rights,
model-training permission and commercial licenses must be separate explicit agreements.

## Commercial and build sequence

1. **Accepted v1**: device-held, visually coherent Edition export; instrument no private-content telemetry.
2. **v1.1**: approved client-side editorial PDF renderer using existing GenCreator capability; human QA across screen sizes and print.
3. **v1.2**: Starlight MethodPack schema + independent claim/evidence review service, initially with synthetic cases only.
4. **v2**: opt-in practitioner marketplace; actual payments only once fulfillment, licenses, disclosures and refunds are verified.
5. **v3**: tenant-owned private/enterprise workflows with explicit consent, deletion and export tests.

Use accepted artifact quality, conversion to real exported editions, 7-day voluntary return, cost per accepted deliverable,
and partner-review latency as candidate metrics. Do not invent utilization/revenue. No new control plane, DB or repository.

## Rollback

Revert the Edition-only export module/UI; `StudioState`, local storage schema, current views and site navigation
remain unchanged. If preview checks fail, leave branch draft and production untouched.
