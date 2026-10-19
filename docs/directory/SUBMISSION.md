# Claude directory submission: the Reality Architect connector (staged)

- **Status:** staged only. Nothing has been submitted. **Frank submits**, in the developer portal at
  <https://claude.ai/directory/manage>, choosing **MCP connector**.
- **Issue:** frankxai/realityarchitect#73 (M2).
- **Coordinates with:** frankxai/product-plans#10 (W5).
  - W5 staged the plugin route for `frankxai/ai-architect` (draft PR frankxai/ai-architect#11) and recorded the
    directory terms.
  - This file is the **connector** route for Reality Architect. The portal treats the two routes as separate
    submission types.
  - The Reality Architect plugin can later be paired with this connector listing.
- **Sources read on 2026-10-06:**
  - <https://claude.com/docs/connectors/building/submission> (the portal steps and requirements);
  - <https://claude.com/docs/connectors/building/review-criteria> (what reviewers check).
  - The Software Directory Terms and Policy are linked from those pages. Frank reads both before he ticks the
    acknowledgements.

## 1. Before you open the portal

Each item says whether it is done in this PR or still open.

- [ ] **Merged and deployed.** The endpoint is live at `https://www.realityarchitect.ai/api/mcp`. Merging to `main`
  deploys production, so the lead merges after a Codex review.
- [x] **Remote, over HTTPS, with no authentication.** The connector serves public data only.
  - The transport is Streamable HTTP, stateless, and answers with `application/json`.
  - It speaks protocol versions 2024-11-05 to 2025-11-25.
  - A client on the 2026-07-28 revision gets a plain 400 and falls back to `initialize`, as that revision specifies.
- [x] **Every tool has a `title` and `readOnlyHint: true`.** They also have `destructiveHint: false`,
  `idempotentHint: true` and `openWorldHint: false`. Tests in `tests/mcp-http.test.mjs` hold this.
- [x] **Tool names are 64 characters or fewer.** The descriptions say what each tool does, and none tells Claude how
  to behave.
- [x] **Inputs are validated** against each tool's declared schema. A bad value returns an error message the agent can
  act on.
- [x] **Responses are a reasonable size.**
  - A Library search shows up to eight full entries and lists the rest by id.
  - A call with no search returns an index.
- [x] **No checkout link, Polar link or price** in any output. Tested over all 30 days, every Library entry, every loop
  and every skill.
- [ ] **Tested in Claude.** Add the URL as a custom connector, then call each tool from a conversation. Also run each
  tool in the MCP Inspector. The portal's Test & launch step asks you to confirm both. `[OPEN: after deploy]`
- [ ] **Rate limit.** Add a Vercel firewall rate-limit rule on `/api/mcp`, for example 60 requests per minute per IP.
  This is a project config change for the lead or Frank. `[OPEN]`
- [ ] **Privacy policy URL.** See §3. `[OPEN: choose the URL]`
- [ ] **Icon.** The site icon (`app/icon.svg`) or the PWA icon. `[OPEN: confirm, and export at the size the portal asks for]`
- [ ] **Support contact.** See §2. `[OPEN: confirm the email]`

## 2. Listing (the portal's Listing step)

| Field | Limit | Value |
| --- | --- | --- |
| Server name | 100 characters | Reality Architect |
| One-liner | 200 characters | Read the Reality Architect Library, the free 30-day Imaginal Act program and the practice loops, with Meaning and Mechanism always labeled. No account. |
| Categories | 1 to 5 | `[OPEN: pick from the portal's list]`. Suggested: Education, Productivity. |
| Documentation URL | | `[OPEN]` <https://github.com/frankxai/realityarchitect/blob/main/docs/directory/SUBMISSION.md#5-tools-with-examples> until a page on the site documents the connector |
| Privacy policy URL | | see §3 |
| Support contact | email or web | <https://github.com/frankxai/realityarchitect/issues>; email `[OPEN: Frank confirms]` |
| URL slug | permanent once published | `reality-architect` `[OPEN: confirm, it cannot change]` |

**Description** (up to 2,000 characters; this text is 1,376, and the one-liner is 151):

> Reality Architect is an open practice for architecting a life: imagine it, build it, witness it. This connector
> brings its public content into Claude, read-only and with no account.
>
> - Search the Library: Reality Theory and the honest canon. Each work is taught as what to keep (meaning), the
>   mechanism it rides on, and its limits, with sources.
> - Read any day of The Imaginal Act, the free 30-day program: the intent, the practice, why it works, and what to
>   record tonight.
> - Get the practice loops (morning, evening, weekly, monthly, decisions and pace) as the steps an agent walks with a
>   person, each with its approval gate.
> - See the marketplace bar every Reality Architect skill must meet, and the engine's verdict on the published skills.
>
> Two registers stay labeled and never blend. Meaning is a contemplative lens and stays the person's own. Mechanism is
> the studied pathway: attention, belief, action, environment, feedback, outcome. Nothing here claims that thought or
> imagery causes events, and nothing promises an outcome.
>
> The connector stores nothing, accepts no personal data and sets no cookies. A person's own practice stays on their
> own device: in the Studio at realityarchitect.ai/studio, or in the Claude Code plugin, whose local MCP server reads
> their files on their machine.
>
> Open source under the MIT licence: github.com/frankxai/realityarchitect.

## 3. Privacy policy

`docs/directory/PRIVACY.md` covers what the directory asks for:

- data collection;
- use and storage;
- third-party sharing;
- retention;
- contact.

Choose one URL for the portal:

1. **Recommended.** Add an "MCP connector" section to <https://www.realityarchitect.ai/privacy> that carries the text
   of `PRIVACY.md`, and use that URL. It is a follow-up PR: `app/privacy/page.tsx` is outside this PR's allowed paths,
   and `tests/product-contract.test.mjs` checks that page's wording.
2. Until then, use the rendered file:
   <https://github.com/frankxai/realityarchitect/blob/main/docs/directory/PRIVACY.md>.

## 4. The other portal steps

| Step | Answer |
| --- | --- |
| Connection | `https://www.realityarchitect.ai/api/mcp`. Every user connects to the same URL. |
| Tools | Four tools sync from the server, all read-only: `library_search`, `program_day`, `loop_prompts`, `skill_check`. |
| Use cases | Learn the Library's works with their limits; follow the free 30-day program day by day; walk a practice loop; check what a skill needs before it can ship. |
| Prerequisites | None: no account, no plan, no setup. |
| Reads or writes | Reads only. |
| Company | `[OPEN: Frank. Company name and website, and a primary contact for review updates]` |
| Authentication | No authentication. The data is public. |
| Data handling | The API is our own first-party content. It handles no personal health data and no sponsored content. |
| Test & launch | No test account is needed. A reviewer adds the URL as a custom connector and runs the examples in §5. Confirm that every tool was run in the MCP Inspector and in Claude. |
| Compliance | Seven acknowledgements. Frank reads the Terms and the Policy, then ticks each one. |

## 5. Tools, with examples

Each example is a prompt a person might type, followed by the call Claude makes.

**`library_search` (Search the Library).** It returns Reality Theory and the honest canon. Each entry carries Keep
(meaning), Mechanism and Limits.

- "What does the Reality Architect Library say about if-then plans?" Claude calls `{ "query": "if-then" }`.
- "Show me the Library entry on implementation intentions." Claude calls `{ "id": "gollwitzer" }`.
- "What is in the Library?" Claude calls `{}`, which returns an index of every entry.

**`program_day` (Program day).** It returns one day of The Imaginal Act: the intent, the practice, why it works with
Meaning and Mechanism labeled, and what to record tonight.

- "Walk me through day 5 of The Imaginal Act." Claude calls `{ "day": 5 }`.

**`loop_prompts` (Loop prompts).** It returns the practice loops as steps, with what each may write after the person's
yes, and its gate.

- "What are the steps of the evening loop?" Claude calls `{ "loop": "evening" }`.
- "List all the practice loops." Claude calls `{}`.

**`skill_check` (Skill bar).** It returns the marketplace bar and the engine's verdict on each published skill. A
person checks their own draft locally, with `reality skill-check`, so the draft is never sent to the server.

- "What does a skill need to ship in the Reality Architect marketplace?" Claude calls `{}`.
- "Does the reality-daily skill pass the bar?" Claude calls `{ "skill": "reality-daily" }`.

## 6. Screenshot plan (3 to 5 shots, each at least 1000 px wide)

The primary page requires carousel screenshots only for **MCP Apps**: PNG, at least 1000 px wide, 3 to 5 images,
cropped to the response without the prompt, with the prompt text given separately, and no video or GIF.

This connector has no UI yet; the `ui://` widgets are M9. The same specification still makes good listing and
documentation images, and M9 can reuse the plan.

**How to capture.**

- Use Claude on the web with the connector added as a custom connector.
- Use a 1440 px wide browser window at device scale 1, which gives a PNG at least 1000 px wide after cropping.
- Use the light theme.
- Crop to Claude's response. Keep the tool-call chip visible, so the image shows the tool that answered.

| # | Prompt (given separately) | What the shot shows |
| --- | --- | --- |
| 1 | "What does the Reality Architect Library say about if-then plans?" | `library_search`: an entry with Keep (meaning), Mechanism and Limits visible |
| 2 | "Walk me through day 5 of The Imaginal Act." | `program_day`: the practice steps, and "Why it works" with **Meaning.** and **Mechanism.** labeled |
| 3 | "What are the steps of the evening loop?" | `loop_prompts`: the numbered steps and the "only after the person's yes" line |
| 4 | "What does a skill need to ship in the Reality Architect marketplace?" | `skill_check`: the bar and nine published skills that pass |
| 5 (optional) | none: the connector's settings in Claude | The four tools, all marked read-only |

Before upload, check every shot: no personal data in view, no checkout link or price, and no teacher name outside a
Library answer.

## 7. Human gates

| Gate | Who |
| --- | --- |
| Merge after a Codex cross-family review (MCP plus an API route) | The Reality Architect lead |
| The Vercel firewall rate-limit rule on `/api/mcp` | The lead or Frank |
| The privacy URL choice, and the `/privacy` section PR | Frank, then an agent |
| The icon, the categories, the slug, the support email and the company details | Frank |
| Testing in Claude and the MCP Inspector, then the screenshots | An agent after deploy, with Frank's account for Claude |
| Ticking the compliance acknowledgements, and Submit | **Frank** |

In ChatGPT, the same URL works as a free practice surface only. No tool output links to a checkout or names a price,
and `tests/mcp-http.test.mjs` holds that.
