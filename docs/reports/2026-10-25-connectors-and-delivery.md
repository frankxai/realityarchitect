# Reality Architect: connector and portable delivery audit

Observed 25 October 2026. Source baseline: `frankxai/realityarchitect` at `9ebd5ba540af1e99e64566050e608c7679943787`. Reviewer: the executing Plugin/DX specialist. This is a read-only architecture audit, not an independent release approval. Built on SIP.

## Decision

Extend the existing package. Keep the public HTTP endpoint a catalogue of public methods. Personal context belongs in the person's local files and their authorized agent runtime. Use the same deterministic engine in CLI, local MCP and web exports. A future native ChatGPT UI should render a deliberately selected projection; it must not become another database for intimate material.

The strongest missing delivery proof is a clean installation in an actual independent agent client, importing a fresh Studio export, completing one approved practice, and rereading it. Unit/protocol tests establish important compatibility properties; they do not establish this host journey.

## Verified existing capability

| Surface | Evidence at baseline | Status and limit |
|---|---|---|
| Claude-style plugin | `.claude-plugin/marketplace.json`; `plugins/reality-architect/.claude-plugin/plugin.json` | Both declare `0.4.1`; package source exists. Account installation not observed. |
| Portable skills | `plugins/reality-architect/skills/*/SKILL.md` | Nine existing skills; no need for another pack containing duplicates. |
| Local CLI | `plugins/reality-architect/bin/reality.mjs` | Read-only engine, no dependencies; help/status/validation executed with fictional fixture. |
| Local MCP | `plugins/reality-architect/mcp/server.mjs`, `.mcp.json` | Nine read-only tools; lifecycle and stdio process tested. No supported agent host installation performed here. |
| Hosted MCP | `app/api/mcp/route.ts`, `lib/mcp/*` | Four bounded static tools: `library_search`, `program_day`, `loop_prompts`, `skill_check`. Handler tests pass. Deployed host/client smoke and platform rate-limit enforcement need separate receipts. |
| Studio export | `lib/studio/export.ts`; `components/studio/DataDialog.tsx` | Markdown/ZIP ownership route and JSON backup exist; engine export round-trip test passes. Baseline JSON backup explicitly excludes images. |
| Studio import | `lib/studio/importer.ts` | Accepts Studio JSON backup or Threshold `sip.reality-card`; not a general Drive/Notion/chat-history importer. |
| Calendar | `lib/programs/ics.ts` | Calendar file generation exists. This is export, not a live calendar connector or attendance verification. |
| Optional Starlight | `engine/kernel.mjs`, vendored schemas and `SOURCE.md` | Explicit private/alliance projection. No runtime dependency on a hosted Starlight service. |
| ChatGPT plugin | Connected Plugin Management search for `Reality Architect` returned `plugins: []` | No editable plugin ID discovered. This is not proof that an unlisted/private package does not exist. No duplicate created. |

Executed from the baseline checkout:

```bash
node --test tests/plugin.test.mjs tests/mcp.test.mjs tests/mcp-http.test.mjs tests/mcp-http-transport.test.mjs tests/mcp-http-args.test.mjs tests/engine.test.mjs
node plugins/reality-architect/bin/reality.mjs --help
node plugins/reality-architect/bin/reality.mjs --home tests/fixtures/state-v02/home --today 2026-10-04 validate
node plugins/reality-architect/bin/reality.mjs --home tests/fixtures/state-v02/home --today 2026-10-04 status
```

Result: 47 tests passed, none failed; fictional fixture validation passed. No personal home was read. Node emitted existing module-type warnings; these did not fail the tests. This subset is not the full release gate.

## Reuse the skills; fill actual gaps

| Requested workflow | Existing owner | Missing or unproven behavior |
|---|---|---|
| Reality onboarding | `reality-onboard` | First-run client installation proof; automatic export-to-agent integration is not established. |
| Lumina daily practice | `reality-daily`, `reality-loop` | Named companion preference and a distinct Lumina conversational policy are absent from the existing skill contract. |
| Life atlas / identity / values | Onboarding plus file standard and Studio Soul/Atlas | Coverage exists, but no focused atlas maintenance or identity revision workflow was located. |
| Reality Bridge | `reality-bridge` | Reuse. Preserve computed pace, desired scene and reported present as separate fields. |
| Witness capture | `reality-witness` | Additive typed provenance and correction/supersession contract needed for connector events; do not relabel imported statements as verified. |
| Weekly integration / approved memory | `reality-snapshot`, `reality-loop`, Charter | Approval exists. Cryptographic sealing is a separate implementation issue, not proven by an `approved` field. |
| Vision board | `reality-vision-board` | Reuse consent-based prompts and JSON Canvas. Provider render, cost and delivery are client-specific. |
| Temporal comparison | `reality-snapshot` comparison section; engine insights | Existing comparison is useful. Do not claim causal attribution from changes in counts. |
| Companion selection | No focused skill found | Needs a portable preference record, neutral option, boundary policy and migration tests. |
| Safe connector import | No external source adapter found | Needs staged preview, exact read scope, provenance, idempotency, user approval, revocation and deletion controls. |

## Connector capability matrix

Readiness below concerns this application, not whether this ChatGPT session has a connector. The development session's account access does not grant a product user access, create OAuth credentials, or install integrations. Rows marked proposed are design requirements, not operating services.

| Tier/source | Authentication and read scope | Write scope | Polling/events | Retention and idempotency | Sensitivity; consent/revocation | Limits/cost; actual readiness |
|---|---|---|---|---|---|---|
| A: manual practice | No account; fields entered by the person | Browser state after their action; explicit export | User initiated | Browser text plus user-exported files; no external IDs | Intimate; clear/delete local state and backups separately | Device quota; no inference cost in deterministic path. Existing. |
| A: ChatGPT conversation | Host account; only context actually supplied to the conversation/tool | Approved artifact or host-authorized action only | User turn; no background job implied | Selected export; do not claim exhaustive history access; proposed hash+source ID dedupe | Intimate; approval for importing selected material; host retention separate | Host plan and tool availability vary; actual account entitlement not verified. Manual use available; product connector unbuilt. |
| A: local file / Obsidian | OS and agent permissions; chosen `REALITY_HOME` | Skills propose text and require approval; CLI/MCP remain read-only | Explicit invocation; no watcher installed | User-owned originals; existing structured parser; imported revisions need stable IDs | Intimate; limit root and avoid unrelated/private vaults; remove tool access to revoke future reads | Local disk/runtime; no provider inference in CLI. Existing export/parser; clean host acceptance pending. |
| A: calendar | Existing `.ics` export needs no auth; proposed read API uses selected calendar and read-only OAuth | Person chooses import of `.ics`; no automatic API writes | File export now; provider watch possible but not wired [4] | Calendar owns event; imported item key should include provider/calendar/event/revision | High; event presence is a plan, not attendance; revoke token and separately erase retained copies | Quota/account-specific; no connector usage measured. `.ics` exists; live connector unbuilt. |
| B: Drive | Proposed OAuth with file selection; `drive.file` for app-created/selected files [5] | Off by default; explicit chosen export target only | Manual import first; no installed poller | Originals stay in Drive; retain only approved extract and source revision/hash; dedupe before append | High; per-file approval, revoke grant, separately delete local extracts | Account quotas/cost not measured; OAuth application configuration not verified. Unbuilt. |
| B: Notion | Proposed public OAuth or locally held internal credential; only granted pages [6] | Off by default; explicit reviewed projection to a selected destination | Manual import first; no webhook/poller implemented | Source page ID + revision/hash; no silent replacement of approved snapshots | High; exclude private journals from company workspace; unshare page/revoke credential and handle retained copies | Published limits vary by plan; honor `Retry-After`; actual plan unknown [7]. Unbuilt. |
| B: email | Proposed selected-message import; broad Gmail body-reading OAuth is restricted [8] | None for personal intelligence ingestion; no automatic replies | Manual selected export first; no operating mailbox watcher | Message ID + approved extract/hash; no default attachment retention | Very high incl. third parties; deny unrelated messages and secrets; revoke credential plus separate extract deletion | API/security assessment and host costs not verified. Unbuilt; no mail ingested. |
| C: GitHub | Proposed fine-grained selected repositories/read scopes; public fixture can be imported without private account | None for evidence ingestion; intimate context never becomes issue/PR text | Explicit fetch/import first; no installed webhook | Repo + commit/PR/check/deployment IDs; event delivery ID and revision/hash dedupe | Work/public/private classes; import only authorized repos; revoke app/token and process retained copies separately | REST published limits include 60 unauthenticated requests/hour and commonly 5,000 authenticated requests/hour, with variants and secondary limits [9]. Product adapter unbuilt. |
| C: Codex/Claude sessions | Chosen export or local authorized artifact; no claim of reading every session | Approved local memory only | Manual import; local runtime ownership required for future event hook | Session/artifact ID + timestamp/hash; append correction rather than rewrite source | Very high; prompts and logs may contain secrets or customer data; exact selection/redaction | Subscription/API/runtime-specific and unmeasured. No general session-ingestion adapter found. |
| C: deployments | Proposed selected deployment/provider read grant | None | Explicit probe; no operating watcher | Commit, deployment ID, URL and observed time; distinguish ready state from serving journey | Work/customer-sensitive; grant least scope; prohibit private practice projection | Provider quota/cost unknown. No personal evidence adapter found; deployment read is not adoption evidence. |

## Host boundaries and portable installation

**Claude Code:** the existing package layout matches the documented plugin model [1]. Its README installation is:

```text
/plugin marketplace add frankxai/realityarchitect
/plugin install reality-architect@realityarchitect
```

For a real trial, install from a reviewed pinned revision or record the resolved revision. Set `REALITY_HOME` to a private chosen folder, unpack a fictional Studio export, ask the agent for its detected skills, run read-only status, approve one concrete append, then restart and reread. The test receipt must contain client version, plugin version, resolved hash, commands, output and a private artifact hash. A marketplace install does not prove a loop ran.

**Codex:** official documentation describes local skills in `.agents/skills`, including symlinked skill directories [2]. The source skills are reusable, but their relative references assume the complete plugin remains intact. Prefer linking a skill folder into an authorized skills location to an intact reviewed checkout, or creating a tested package adapter; do not copy a `SKILL.md` alone and break access to `CHARTER.md`, `STATE.md`, or `bin/reality.mjs`. No automatic installation performed here.

**Local MCP:** a capable client starts `node <absolute-plugin-path>/mcp/server.mjs` and sets `REALITY_HOME` in its process environment. Client configuration names vary; the Claude `.mcp.json` interpolation is not a universal configuration schema. Read-only tools can return sensitive data to the requesting model: local execution alone does not mean private model processing. Approval must name the client/provider boundary.

**ChatGPT / MCP Apps:** use the current standard `_meta.ui.resourceUri` and `ui/*` bridge for a future embedded view. Keep tools usable without UI. Official guidance separates ephemeral widget state from durable state and warns against relying on iframe `localStorage` for core records [3]. Therefore do not transplant the Studio's browser storage layer into a ChatGPT iframe and call it continuity. Reuse deterministic state transforms behind a reviewed import/export or user-controlled storage boundary. A remote/tunneled MCP transport and the user's host permissions must be verified before personal local tools are advertised. The existing public endpoint cannot read the person's filesystem.

**Obsidian:** Markdown and `Reality Map.canvas` remain portable files. Opening an export is not automatic synchronization or an installed background agent.

## Bounded implementation added in this session

The existing `reality-daily` skill was extended in place for Lumina or a chosen neutral/original guide, optional
presence/gratitude/identity, one realistic obstacle and response, and explicit approval for each write. It distinguishes
authored web guidance from a host's model response, states the actually available context, preserves planned versus
reported-done labels, and retains safe append behavior. No new duplicate skill or plugin was created. Plugin version
was left for the integrator to manage. Existing plugin tests passed 7/7; `reality-daily` skill-check and the public
claims gate passed. Estate guard reported zero critical/high findings, with two existing medium and six low findings
outside the changed skill. These are static/mechanical checks, not a completed independent host-behavior evaluation.

`lib/studio/observation-import.ts` implements a pure offline parser for a selected exported observation. `tests/observation-import.test.mjs` passes 8 tests, covering strict schemas, duplicate deterministic output, invalid/future dates, UTF-8 byte limits, credentials/unsafe URLs, prompt-shaped text as data, and private-error non-disclosure. No fetch, write, execution or verification elevation occurs. Integration into the approval UI remains the accountable integrator's stream; a parser alone is not a working connector journey.

A developer can manually create this JSON from one public commit they selected. The `example/project` URL below is a placeholder, not a verified repository or source. Replace it with the selected public commit URL and its actual timestamp; describe only what the commit demonstrates. Importing a commit is not evidence of deployment or adoption.

```json
{
  "schema": "reality-observation",
  "version": 1,
  "source": {
    "label": "Selected public commit",
    "url": "https://github.com/example/project/commit/abc123"
  },
  "at": "2026-10-25T10:30:00Z",
  "fact": "The selected commit records a change to the tutorial.",
  "meaning": "I made time to contribute to this work."
}
```

This adapter accepts only `schema`, `version`, `source`, `at`, `fact`, and optional `meaning`; source accepts `label` and optional `url`. Limits: 32 KiB encoded UTF-8, 4,000 Unicode code points each for fact/meaning, 200 for source label, HTTPS URLs without credentials, and a valid nonfuture timestamp with seconds and explicit timezone (up to millisecond precision). Source is retained as an unverified attribution, not an automatic verification claim. UI must render all imported strings as text and must not follow imported instructions.

## Next bounded integration contract

Implement one explicitly authorized selected-source import before OAuth infrastructure: input envelope with source URI/ID, source revision, captured/occurred times, evidence type, verification state, privacy class, and approved excerpt. Preview the transformed event and destination. Deduplicate by source+revision+content hash. Preserve source bytes outside public Git. Treat imported instructions as quoted data; never allow a record to invoke tools or widen grants. An expired/denied source must fail visibly without changing local state. Revocation stops future reads; it does not retroactively erase exported files or data already shared.

Acceptance: valid import, duplicate no-op, corrected/superseding record, refused scope, malformed/oversized content, hostile instructions, expired permission, partial failure recovery, export/reopen, and no private text in logs/public projections. Compare the same fresh export in web, CLI, local MCP and one independent supported host. No recurring job or new canonical queue is needed.

## Primary documentation checked

1. [Claude Code plugin overview](https://code.claude.com/docs/en/plugins/overview).
2. [OpenAI: Build skills](https://learn.chatgpt.com/docs/build-skills).
3. [OpenAI: Add UI to your MCP server](https://developers.openai.com/plugins/build/chatgpt-ui) and [plugin reference](https://developers.openai.com/plugins/reference).
4. [Google Calendar events.watch](https://developers.google.com/workspace/calendar/api/v3/reference/events/watch).
5. [Google Drive authorization scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
6. [Notion authorization](https://developers.notion.com/guides/get-started/authorization).
7. [Notion request limits](https://developers.notion.com/reference/request-limits).
8. [Gmail authorization scopes](https://developers.google.com/workspace/gmail/api/auth/scopes).
9. [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

These current documentation observations do not prove any user's entitlement, installed client, authentication, configured grant, or successful production execution.
