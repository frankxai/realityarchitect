import { site } from '@/lib/site'

export const revalidate = 3600

const AGENTS_MD = `# Reality Architect — Agent Surface Guide (AX)

> Brand: **${site.name}** (\`${site.url}\`)
> Author: ${site.author}
> Focus: ${site.headline}

## Canonical discovery & standard surfaces

- [\`/llms.txt\`](${site.url}/llms.txt) — Concise machine-readable overview of the Architect's Loop, \`reality.md\`, and public pages.
- [\`/llms-full.txt\`](${site.url}/llms-full.txt) — Expanded machine-readable documentation.
- [\`/.well-known/agent.json\`](${site.url}/.well-known/agent.json) — Structured discovery descriptor for browser-local storage, open MIT templates, and endpoints.
- [\`/api/mcp\`](${site.url}/api/mcp) — MCP server endpoint.
- [\`/standard\`](${site.url}/standard) — Specification for \`~/reality.md\`, \`~/soul.md\`, and the Agent Charter.

## Core human & agent practice routes

- [\`/method\`](${site.url}/method) — The five sequential moves of the Architect's Loop.
- [\`/studio\`](${site.url}/studio) — Reality Studio: local-first browser workspace with Markdown export you own.
- [\`/threshold\`](${site.url}/threshold) — The Imaginal Act practice (authored scene + verifiable next act).
- [\`/assess\`](${site.url}/assess) — Local system-gap assessment exported as a Markdown architecture brief.
- [\`/library\`](${site.url}/library) — Grounded canon separating meaning from studied mechanisms and explicit limits.

## Charter & honesty boundaries

1. **Meaning and mechanism stay distinct:** Meaning (the authored scene, values, vows) and mechanism (repeatable skills, reps, studied pathways) are always labeled separately.
2. **Local-first ownership:** Assessment and Studio state stay in the user's browser until explicitly exported as Markdown.
3. **Meaning vs. outcome boundaries:** Never claim thoughts, vibration, or scripts directly alter external events or promise predetermined outcomes.
4. **Open MIT repository:** Public templates, plugins, and standard live at ${site.github}.
`

export function GET() {
  return new Response(AGENTS_MD, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
