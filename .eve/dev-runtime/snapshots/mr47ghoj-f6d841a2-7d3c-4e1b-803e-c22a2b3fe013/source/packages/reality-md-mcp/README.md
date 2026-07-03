# reality-md-mcp

The MCP server for **reality.md** — the file your AI agents read before they act.

What `AGENTS.md` is to a repo, `reality.md` is to you: who you are, what you're building, what your agents may and may not do. This server gives any MCP client — Claude Code, Claude Desktop, Cursor — read/write access to yours.

Generate a personalized `reality.md` in two minutes at [realityarchitect.ai/architect](https://realityarchitect.ai/architect).

## Install

Claude Code:

```bash
claude mcp add reality-md -- npx -y reality-md-mcp
```

Claude Desktop / Cursor (`mcpServers` config):

```json
{
  "mcpServers": {
    "reality-md": {
      "command": "npx",
      "args": ["-y", "reality-md-mcp"]
    }
  }
}
```

By default the file lives at `~/.reality/reality.md`. Point it elsewhere with:

```json
{ "env": { "REALITY_MD_PATH": "/path/to/reality.md" } }
```

## Tools

| Tool | What it does |
| --- | --- |
| `read_reality` | Read the full reality.md. Agents should call this before acting on your behalf. |
| `init_reality` | Create reality.md from the standard template (or provided content). |
| `update_section` | Surgically replace one `## Section` body, leaving the rest intact. |
| `replace_reality` | Overwrite the whole file (explicit rewrites only). |

## The standard

The `reality.md` format is an open standard, documented at [realityarchitect.ai/standard](https://realityarchitect.ai/standard). The short version:

```markdown
# reality.md — <name>

## Who I am
## Current stack
## My gap: Move 0X — <Move>
## Next build (this month)
## Build order
## Rules for my agents
```

Keep it under 60 lines. Every line should be true, current, and useful to an agent.

## License

MIT — part of [realityarchitect](https://github.com/frankxai/realityarchitect).
