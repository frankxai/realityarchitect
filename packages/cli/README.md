# @reality-architect/cli

> Unified Cockpit CLI & Stdio MCP Server for Reality Architect — context grounding, `reality.md` conformance, and empirical diffusion assessment for AI agent harnesses.

Part of the **Reality Architect** ecosystem.

---

## Capabilities

- **`reality.md` Conformance Engine**: Check any `reality.md` against formal L0–L3 conformance levels.
- **Harness Projection Emitter**: Compile tailored context projections for Claude, Cursor, OpenCode, Codex, and Antigravity.
- **Empirical Diffusion Engine**: Assess agent claims, code blocks, or factual statements against 6 empirical indicators, detect failure modes, and apply certainty caps.
- **Stdio Model Context Protocol (MCP) Server**: Exposes 5 production tools directly to LLM agent harnesses.

---

## Installation & CLI Usage

Run without installing:
```bash
npx @reality-architect/cli --help
```

Or install globally:
```bash
npm install -g @reality-architect/cli
```

### Commands

```bash
# Validate conformance
reality-architect validate ~/reality.md

# Emit Claude context
reality-architect emit ~/reality.md --target claude

# Output dependency graph
reality-architect graph ~/reality.md

# Assess empirical claim confidence & check certainty capping
reality-architect assess "The API endpoint has 100% guaranteed zero downtime"

# Launch Stdio MCP Server
reality-architect --mcp
```

---

## Model Context Protocol (MCP) Integration

Add to your `claude_desktop_config.json` or Antigravity MCP settings:

```json
{
  "mcpServers": {
    "reality-architect": {
      "command": "npx",
      "args": ["-y", "@reality-architect/cli", "--mcp"]
    }
  }
}
```

### Exposed MCP Tools

1. **`reality_validate`**: Validates a `reality.md` file or text against conformance levels (L0-L3).
2. **`reality_emit`**: Emits tailored context files (`claude`, `cursor`, `opencode`, `codex`, `antigravity`).
3. **`reality_brief`**: Extracts the next-artifact build gap brief.
4. **`reality_graph`**: Outputs the node and edge invariant dependency graph.
5. **`reality_assess`**: Evaluates empirical reality confidence and applies certainty caps to prevent hallucinations.

---

## License

MIT © Frank Riemer / Reality Architect
