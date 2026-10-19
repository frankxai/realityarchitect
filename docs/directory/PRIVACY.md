# Privacy: the Reality Architect MCP connector

- **Applies to:** the public MCP endpoint at `https://www.realityarchitect.ai/api/mcp` (the "connector").
- **Last updated:** 2026-10-06.
- **In short:** the connector stores nothing, accepts no personal data, and sets no cookies. It has no accounts.

## What the connector is

The connector is a public, read-only MCP server. It answers with the site's own public content and nothing else:

- the Library;
- the free 30-day program, The Imaginal Act;
- the practice loops;
- the marketplace bar for skills, applied to the skills the plugin publishes.

It never reads, receives or keeps a person's practice. A person's own files (`reality.md`, `soul.md`, `reality/`) are
read only by the local MCP server in the Claude Code plugin, on that person's own machine.

## What it receives

Each request is one JSON-RPC message from your MCP client, such as Claude or ChatGPT. It holds:

- the method, and for a tool call, the tool's name;
- the tool's arguments, which are all bounded:
  - a search query of at most 200 characters;
  - a Library id;
  - a day number from 1 to 30;
  - a loop name;
  - a skill name;
- in the opening `initialize` message, the client's name and version, as the MCP protocol requires.

The connector asks for no personal data, and no tool takes any. Please do not put personal information in a search
query: it is used only to filter the Library and is then discarded.

## What it does with a request

- **Processing.** It computes the answer in memory from files that ship with the website, sends the answer back, and
  discards the request.
- **Storage.** Nothing is written to a database, a file or a cache. There is no session: the connector never issues a
  session id.
- **Cookies.** The connector sets no cookies.
- **Our logs.** The connector's code writes no log line about requests, and never logs a request body or a tool's
  arguments.
- **Hosting logs.** The website runs on Vercel. As for any page of the site, Vercel processes ordinary request metadata
  for delivery, reliability and security, such as the IP address, the time, the path and the user agent. It may keep
  that metadata under its own policies. That metadata does not include the request body. See the site's privacy page:
  <https://www.realityarchitect.ai/privacy>.

## Third parties

- The connector calls no other service. It makes no network requests, runs no AI model, and has no analytics or
  telemetry.
- Your MCP client sends the request, and your conversation stays with that client under its own terms. For Claude,
  see Anthropic's privacy policy.

## Retention

The connector retains nothing. Vercel's request metadata is kept under Vercel's retention.

## Changes and contact

- If what the connector receives or keeps ever changes, this page changes first, with a new date.
- Questions: open an issue at <https://github.com/frankxai/realityarchitect/issues>.
- Contact email for the listing: `[OPEN: Frank confirms the address]`.
