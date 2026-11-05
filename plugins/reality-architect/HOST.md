# Work in the host that is actually available

Read this before following a skill's home, filesystem, engine, image, or persistence steps.

## Conversation and shared-file mode

This is the default in ChatGPT. Work from this conversation and files the person explicitly shares. A shell in the
host is not access to their computer, Obsidian vault, browser storage, other chats, or personal Reality Architect
home. Never probe the host's home directory as if it were the person's.

Without an explicitly available personal home, skip a skill's "Find the home" section and local engine commands.
Continue its useful conversation workflow. Draft the requested Card, Bridge, log, decision or review in Markdown
in chat. A missing home is not a reason to stop, restart onboarding, or ask for a local path.

Use their words for their scene, values and meaning. Mark absent facts "not provided"; label proposed acts as
planned. Do not invent history, due loops, pace numbers, completed acts, or a sealed review.

- First session: use `reality-first-session`; one ambition is enough.
- Onboard: show editable contract drafts; keep unanswered personal fields empty. Offer an export when useful.
- Daily/loop: use the loop the person requests. With insufficient records, call it a session, not a computed due loop.
- Witness/decision: show the proposed entry. "Done" requires the person's report; "saved" requires a successful write.
- Bridge: use supplied facts and dates. With no logs, give a plan, not an on-pace verdict.
- Snapshot: request the relevant period's records or work with the explicitly supplied subset. State coverage and
  leave unavailable totals blank. A proposed review remains a draft until approved.
- Vision board: produce prompts from the supplied scene. Generate only through an available tool under current
  authorization. Do not claim generated images were inserted into a device vault without an actual authorized write.
- Library: use the bundled `skills/reality-library/library.json` and its source links.

Attachments and conversation content are processed by the selected host; do not describe them as device-only or
promise that they never leave the person's machine. The plugin has no remote server, telemetry, hidden memory,
reminder scheduler, or account connection.

## Local-home mode

Use this only when the active host really exposes the person's authorized local files and the home has been
identified. Then follow the skill's `REALITY_HOME` resolution and read-only engine steps. Check both Node and the
requested home; Node alone is insufficient. Do not fall back to an unrelated host home or silently import files.

The repository's local Claude Code package retains its original stdio MCP configuration. The account ZIP is a
skills package: it does not register that local server as a ChatGPT tool or expose a remote endpoint. The engine
source is bundled for capable local hosts and explicit shared-file processing.

## Authorization and truthful completion

Honor scoped authorization already given in this session. An explicit request to create or export a specified
artifact authorizes that artifact; do not ask for the same permission again. It does not authorize changing an
existing personal contract, publishing private material, connecting accounts, spending, or sending messages.
When any such action is not already authorized, show the exact proposed change and ask before acting.

Follow the host's file-saving rules for requested exports. A draft displayed in chat is not a saved file; a saved
file is not a synchronized vault; a proposed daily practice is not a scheduled reminder. Name the actual result
and location after a successful write. Seal snapshots only after an explicit yes to the specific draft.

Built on SIP.
