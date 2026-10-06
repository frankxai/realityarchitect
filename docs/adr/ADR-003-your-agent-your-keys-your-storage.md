# ADR-003: Your agent, your keys, your storage

- **Status:** proposed 2026-10-06. It supersedes ADR-001 and re-scopes handover missions M4–M7, M11 and M12.
  - Frank confirms it, because it changes the prices he will publish.
  - Until he does, nobody builds ADR-001's server pieces. The doctrine below already rules them out.
- **Why now.** Frank ruled the estate product doctrine directly (`w0-starlight-estate/TRUTH.md` §2, private). A ruling
  of his outranks every ADR.
  - ADR-001, the GTM plan's later sales and draft PR #56 were written without it.
  - They assume hosted accounts, cloud storage, renders and audio paid on our keys, monthly plans, a seat licence and a
    live cohort.

## 1. The doctrine, in short

| Rule | What it means here |
| --- | --- |
| The customer's agent is the runtime | Reality Architect runs in the person's Claude Code, Codex, Cursor or Obsidian, and in their browser. |
| No multi-tenant SaaS | We never run a server that holds a person's practice, and never pay for their compute. |
| Bring your own key (BYOK) | Image, voice and model calls use the person's own key or tool, so a sale costs us nothing to serve. |
| Self-service only | No one-to-one delivery, no live cohort, no support queue. |
| The person owns data and keys | No custody, so there is the least legal surface. |
| Multi-marketplace | Polar, Gumroad, Etsy, Whop and Stripe, plus owned sites. |
| Agents build and operate | If a product needs Frank twice, the pipeline is wrong. |

Reality Architect was already shaped this way at its core:

- a local-first Studio;
- a zero-dependency engine that runs in the person's own agent;
- an MCP server over stdio;
- a kernel projection whose files the person owns (ADR-002).

This ADR removes the parts that drifted toward a hosted service.

## 2. The decision: what changes

| Was | Now | Why it is better for the person |
| --- | --- | --- |
| **Accounts** (ADR-001): Better Auth, passkeys, Neon | **No accounts.** Buying the files is the licence, so most packs are keyless. Where a key adds something (a yearly pass that unlocks later packs), the plugin checks it against the selling store's own licence API (Polar or Gumroad) and caches the result on the device. | Nothing to sign up for, and no one holds a profile of them. |
| **Studio Cloud** (ADR-001): encrypted blobs in our R2 | **Bring your own storage.** The Studio writes its export, optionally encrypted with a passphrase, to a folder the person picks. Their own iCloud, OneDrive, Google Drive, Dropbox or Git syncs it. Obsidian stays the second home (`reality/` folder). | Sync works on day one, at no cost, and survives us. |
| **Renders** (M6): our AI Gateway key, a monthly cap, credits | **BYOK.** The plugin hands `imagePrompt` (from `lib/studio/export.ts`) to the person's own agent and image tool. The Studio may also accept a key that stays on the device and call the provider directly, if that provider allows browser calls. Never proxied. | They choose the model, see the cost, and their images never touch our servers. |
| **Personal rehearsal audio** (M7): a Vercel Workflow and credits | **A `reality audio` command** in the plugin. It runs `scripts/audio` on their machine with their ElevenLabs key, or with a local system voice, and their own ffmpeg. | Nothing reaches our servers. With ElevenLabs, only the script goes to their own account, after consent for each track. With the local voice, nothing leaves the machine, though it sounds plainer than the paid narration. |
| **Plans** (#56): Architect $19 a month, Founding $120 a year, render packs | **One-time products.** These are the Complete Edition (it exists but is closed; $39 is proposed, #78), practice packs and the Guide Kit, plus a possible yearly "every new pack" pass, which is a licence to content and not a service. | People pay once for something they keep. |
| **Guide licence** (M11): $79 a month, 15 seats, end-to-end-encrypted re-wrapping | **The Guide Kit, one-time.** It holds a facilitation guide, session templates, a consent form and a review checklist. A client shares an `alliance` kernel bundle (ADR-002, built in #67) through any channel they choose. | The alliance view already limits what a guide can see (ADR-002 §4: the aims, done-whens, reps and moves exactly as titled, plus dates, statuses, pace and witness kinds; never meaning, scenes, facts or obstacles in their words, people, places or soul), and the client decides every share. A file already sent cannot be recalled. |
| **Marketplace** (M11): creators keep 85% through our payouts | **An open pack format** in a public registry repo, gated by `skill-check` in CI. Creators sell on their own storefronts, and we list the packs that pass the bar. Our own packs sell on every marketplace. | No payouts or custody for us, and creators keep 100%. |
| **School** (M12): a $490 live cohort, with scholarships | **A recorded, self-paced course** built from the program, the Library and the audio. Pay-what-you-can codes replace scholarships. | It starts any day, and it does not need Frank. |

### The one hosted surface

The public, read-only MCP endpoint (M2) serves the site's own public content: the Library, the program days and the
loop prompts.

- It has no accounts and stores no personal data.
- It runs no inference, and its per-request work is a static lookup.
- So it is a web page in another protocol, not SaaS. Every personal tool stays in the local stdio server.

If Frank rules on the thin licensing plane proposed in TRUTH §6.9, licence checks may move there. Until then, they use
the store's own API.

## 3. Consequences

- **Kept:** ADR-001 stays as history, marked superseded. Its threat thinking still applies to the optional passphrase
  encryption of exports, which uses AES-GCM with a key derived by PBKDF2 or Argon2 in the browser.
- **Removed from the roadmap:** Better Auth, Neon, R2, the AI Gateway cap, Polar subscriptions and the credits meter.
  Frank's buttons for them (the Neon project, the AI Gateway key and cap) are retired.
- **#56 `/pricing` needs rework before merge.**
  - List: Free forever (everything to practise), the Complete Edition, and "packs and the Guide Kit, coming" with no
    price until Frank sets one.
  - Drop: the monthly plans, render packs and "creators keep 85%".
  - Keep `PAID_OPEN=false` until Polar is live.
- **The GTM order becomes:**
  1. the Complete Edition;
  2. practice packs (new 30-day programs and themed loop sets);
  3. the Guide Kit;
  4. the self-paced course.

  Recurring income comes from catalogue breadth, new editions and the optional yearly pass. It does not come from
  hosting people's data.
- **Release rule (estate `product-plans` AGENTS.md):** anything with a checkout needs a fresh `PRODUCT-RELEASE-GATE.md`
  PASS ("in the estate root") and a row in `graph/products.graph.json` before it goes live. Neither file was found on
  this machine or in `product-plans` on 2026-10-06, so locating them is part of #78.
  - The Complete Edition also needs the EU checkout checklist (`frankxai/product-plans#11`).
  - The EPUB needs epubcheck (`#9`).
  - The directory package for M2 needs W5 (`#10`).

## 4. Open questions for Frank

1. Confirm this ADR. That retires ADR-001's server stack and the monthly plans.
2. Is the yearly "every new pack" pass acceptable? It is a content licence, with no hosted compute.
3. Will you stamp TRUTH §6.9 (the thin licensing plane), or keep licence checks on the store's API?
