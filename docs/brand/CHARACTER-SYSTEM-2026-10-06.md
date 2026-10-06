# Reality Architect character system and implementation contract
Date: 2026-10-06
Status: candidate art direction and implementation recommendation. Names are working names, not cleared commercial marks. No production UI or agent runtime is changed by this document.

## Decision
Give Reality Architect an owned mascot family: one recognizable lead, one companion pet and two specialist droids. Let Starlight share craft and engineering conventions while retaining its own institutional identity. Mini Frank anchors authorship across the portfolio.

A mascot is an interface to a role and an expressive brand asset. It does not create an agent, prove a model's competence or authorize action. Keep visual identity independent of the provider: the same Architect role can run with different permitted models.

## Character bible
| Character | Invariants | Role and presence |
| --- | --- | --- |
| Aro | Open inverted-U arch helmet; inset smoked face; two short vertical amber eyes; warm ivory ceramic; graphite joints; copper hinge pins; tiny blueprint-blue chest indicator; stable broad boots | Reality Architect lead. Orient the first bridge, propose the next step, explain what needs review. Calm, capable, deliberate |
| Pip | Quadruped angular fox; wedge head; architectural triangular ears; graphite paws/snout; folded segmented copper/ivory tail; amber eyes | Optional pet and continuity companion. Reflects actual work/save status and links to the relevant activity |
| Kite | Flattened triangular paper-kite body; one central dark lens; ceramic wings; copper edges | Discovery/survey role. Source gathering and orientation, always paired with provenance |
| Ledger | Compact wheeled folio body; graphite spine; warm ivory cover; brass tab; small dark face | Archive/restore role. Backup, export and proposed snapshots; no autonomous sealing |
| Mini Frank | Swept-up brown hair; lighter beard sides; defined moustache/chin beard; black outfit with black buttons; sunglasses only when specified | Human author/mentor. Uses approved founder statements and authored learning material |

The generated Mini Frank scene follows the existing text brief; it is not an exact likeness match to a supplied portrait or the earlier canonical character sheet. Before shipping it as an official avatar, compare against the approved source sheet.
The existing white/black boxy robot, copper robot with goggles and red lobster from the Mini Frank cast remain separate existing characters. Do not rename them into this family or silently revise their canon. Use guest appearances only when a scene calls for them.
Hold the number of primary silhouettes stable. Add a new character only for a durable role that the current cast cannot express.

## Brand architecture
Reality Architect: intimate studio, dawn/graphite/blueprint, vellum, bridge maquettes and an honest practice record.
Starlight Intelligence: institutional Horizon and Operator modes; broader scientific/civilizational scope, readable real system state, controlled cyan/teal/violet/gold. Do not turn the cockpit into a mascot playground.
Starlight Academy: brighter Academy mode, authored teaching, inspectable learner artifacts and visible mastery. Mini Frank has mentor presence; Aro can guide practice as an invited Reality Architect character.
GenCreator's red Edition Lab robots remain a distinct studio family. Arcanea's fictional characters remain authored-world IP. Shared rendering quality is not shared product authority.
Keep each brand's existing wordmark and token authority. The mascot does not replace the logo, privacy language, technical proof or human owner.

## Official ecosystem inspiration
GitHub's official toolkit identifies Mona, Copilot and Ducky with distinct contexts. Its public-use guidance requires approval and rules out their use as another product's branding. Learn role clarity, silhouettes, consistency and restraint; use approved vendor marks in integration references rather than adopting their mascots as our crew.
OpenAI's current Pets documentation supports optional/custom companions across supported desktop, web and terminal surfaces. Appearance does not change how tasks are performed. Its real activity states are Running, Needs input, Ready and Blocked.
Clawd is a useful reference for highly reduced terminal character design. Vendor-repository discussion is not a broad commercial license or a complete mascot canon. Do not source assets or rights from similarly named coin/fan sites.
No claim that this plan inventories every official vendor pet. Maintain a dated source register when adding ecosystem examples.

## Candidate assets generated in this session
| Asset ID | Description | Verification | Production gap |
| --- | --- | --- | --- |
| ra-family-atelier-v01 | Aro, Pip, Kite and Ledger together, dawn atelier campaign | 1536×1024 RGB; visually reviewed | City backdrop feels more fantastical than current grounded website direction; use as exploration |
| ra-aro-pip-duo-v01 | Aro and Pip cutout master | 1536×1024 RGBA; alpha range 0–254 verified | Broad light/shadow halo needs compositing review and clean individual silhouettes |
| sis-academy-founder-crew-v01 | Proposed Mini Frank with Aro, Pip and Kite in a canal-side academy | 1536×1024 RGB; visually reviewed | Founder likeness and canonical reference matching remain unverified |

Generation used the built-in image-generation tool. These are candidate stills, not animated pet packs, vector logos, 3D rigs or operational agents.
Master hashes and exact prompts are recorded in CHARACTER-ASSETS-2026-10-06.json. Image masters are the attached generated artifacts; this documentation PR does not publish the PNGs or pretend they are already served by the website.

## Foundational asset pack
Produce once, version and reuse:
1. Character identity sheet: front, profile, back, three-quarter, size relationship, approved materials/colors, hand/eye/ear/tail construction, prohibited variants.
2. Individual clean alpha masters: Aro, Pip, Kite and Ledger, plus small silhouette tests at 32/64/128 px. A detailed full-body render cannot substitute for a legible small avatar.
3. Pose vocabulary: welcome, inspect, work, needs input, ready, blocked, restore, rest. Always preserve identity and scale.
4. Campaign compositions: grounded atelier, bridge close-up, archive ritual and brighter Academy scene, each with desktop/mobile crop and text-safe zones.
5. Motion masters: a reusable rig and authored clips; image-to-video for exploratory films, not deterministic product status.
6. Provider-specific exports: web still/short clip, validated custom-pet atlas, docs stickers and edition covers.
7. Manifest: ID, revision, source references, prompt, hash, dimensions, alpha, rights/provenance, alt text, safe crops, review status and consuming surfaces.

Store canonical character rules in starlight-design-intelligence's Reality Architect brand pack after direction approval. Use the estate's governed media store for image/rig masters; ship optimized assets to the consumer repo/CDN with immutable versioned URLs. A rendering prompt is not a Blender rig.
Do not invent a 3D scene by converting a generated picture into a claimed editable model. Commission or build a model against the chosen turnaround sheet, then render consistently.

## Runtime contract
Two state streams remain separate:
- Practice storage: saved locally / unsaved / conflict / quota failure / restore pending.
- Agent run: idle / running / needs input / ready for review / blocked / canceled.
A pet's activity label must name the stream; “ready” must not imply “saved” or “approved.”

Map state to animation through a pure adapter, with stable runId, event sequence, source and timestamp. Deduplicate/reconcile updates; a disconnected stream becomes visibly unknown, not infinitely “thinking.” Only a verified write receipt produces a saved state.
Character configuration holds role identity and animation assets. Runtime permission policy holds tools, data scope, budgets and approval. Neither the mascot name nor an animation can grant capabilities.
Clicking Aro opens the bridge/action context. Clicking Pip opens the explicit status/activity view. Kite opens cited sources. Ledger opens the export/restore or proposed snapshot review. No automatic external action.
Default small/quiet presence; user can hide or disable. Respect reduced motion; static status text remains complete. Announce meaningful state changes accessibly once. Never communicate only through color, eyes or motion.
Stop loops when offscreen or the tab is hidden. Product work must not be blocked by missing decorative art.

## Web implementation
Use Next.js image handling for posters and responsive stills. Separate explanatory content from atmosphere; real bridge/evidence UI stays HTML/SVG.
Use GSAP for a small explicit onboarding sequence and the approved scene-to-bridge transition, with scoped React cleanup and reduced-motion media queries. Do not pin or animate the ordinary editor workflow continuously.
Start with sprite/CSS/short alpha clip for the companion. Use a rigged glTF model and React Three Fiber only after a measured interaction benefit justifies loading a 3D runtime; lazy load it beyond the first useful content.
Proposed consumer paths after approval: public/brand/reality-architect/<revision>/, components/companions/, lib/companions/ and a versioned manifest. Do not add four separate agent widgets.
QA: keyboard/focus, reduced motion, hide preference, background tab, interrupted load, small screens, dark/light compositing and zero interference with forms. Measure baseline and added transfer/CPU cost. LCP/INP/CLS remain the targets in the existing upgrade plan.

## Custom ChatGPT/Codex pet adapter
Current official web upload: transparent PNG/WebP, exactly 1536×1872, ≤20 MiB. Neither generated 1536×1024 image qualifies.
Use the current bundled hatch-pet workflow/specification to determine frame layout, states, pivots, atlas metadata and local installation. Build one Pip or Aro pack first, not a separate pet for each model.
Validate exact dimensions, real alpha, frame grid, clipping, pivot consistency and file size mechanically. Smoke test on the intended desktop/web/terminal version. Document version/platform differences.
Terminal support currently depends on suitable iTerm2/Kitty graphics/Sixel and is unavailable inside tmux/Zellij; the IDE extension has no pet picker. Do not advertise uniform deployment everywhere.
Desktop custom pets remain local and do not automatically sync to web. Provide distinct install/export adapters; never claim that a website companion installation configures the user's desktop.
This environment created concept images only. No desktop pet was installed.

## Commercial application
Free: optional Aro/Pip product presence, open practice and export.
Paid: character-led Complete Edition, facilitator materials and a genuinely tested agent/pet kit. Show the artifact, install result and support boundary.
A cosmetics pack can be an accessory; recurring revenue should come from maintained capability/content, not invented pet needs or a disguised inference subscription.
Use original characters in owned merchandise only after name/design checks and production proofs. Use vendor names/marks for truthful integration references under their applicable policies.

## Execution
Wave 1: choose this candidate family, lock identity sheets, resolve alpha/likeness issues, build the first bridge journey and complete backup recovery.
Wave 2: implement one optional Aro/Pip companion adapter to actual local-state events; verify the normal editor with the companion disabled.
Wave 3: install and test one custom pet pack; ship the Complete Edition with consistent covers and character direction.
Wave 4: rig-based Academy stories and agent runtime activity after the actual runtime contracts are tested.
Keep the roadmap on Reality Architect #80/#46. This proposal does not take ownership of other brands' active implementation lanes.

## Source register
Checked 2026-10-06:
- https://brand.github.com/graphic-elements/mascots
- https://developers.openai.com/codex/pets (redirects to https://learn.chatgpt.com/docs/pets)
- https://github.com/anthropics/claude-code/issues/8536 (community request in vendor repository, not a license)
- https://github.com/frankxai/starlight-design-intelligence/blob/main/brand-packs/sis/DESIGN.md
- https://github.com/frankxai/starlight-design-intelligence/blob/main/brand-packs/reality-architect/DESIGN.md
