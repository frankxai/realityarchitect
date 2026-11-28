import { site } from '@/lib/site'

export const dynamic = 'force-static'

export function GET() {
  return Response.json(
    {
      schema: 'starlight.agent.v1',
      name: site.name,
      domain: site.domain,
      canonical: site.url,
      headline: site.headline,
      description: site.description,
      license: 'MIT',
      repository: site.github,
      storage: {
        mode: 'local-first',
        exportFormat: 'markdown',
        note: 'Assessment and Reality Studio state stays local in the browser unless the user exports Markdown.',
      },
      discovery: {
        agentsMd: `${site.url}/agents.md`,
        llmsTxt: `${site.url}/llms.txt`,
        llmsFullTxt: `${site.url}/llms-full.txt`,
        standard: `${site.url}/standard`,
        mcpEndpoint: `${site.url}/api/mcp`,
      },
      surfaces: {
        home: site.url,
        method: `${site.url}/method`,
        studio: `${site.url}/studio`,
        threshold: `${site.url}/threshold`,
        assess: `${site.url}/assess`,
        library: `${site.url}/library`,
      },
      disclosures: [
        'Meaning and mechanism are separated across public pages; no causal claims or outcome promises are made.',
        'Open source method, plugins, and reality.md templates are published under MIT at GitHub.',
      ],
    },
    {
      headers: {
        'cache-control': 'public, max-age=3600, s-maxage=86400',
      },
    },
  )
}
