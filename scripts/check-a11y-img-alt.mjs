import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

function main() {
  const routes = [
    '.next/server/app/index.html',
    '.next/server/app/start.html',
    '.next/server/app/assess.html'
  ]
  const failures = []

  for (const route of routes) {
    const filePath = path.join(process.cwd(), route)
    if (!fs.existsSync(filePath)) {
      failures.push(`Build artifact not found: ${route}. Run 'next build' first.`)
      continue
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const imgRegex = /<img\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      const attributes = match[1]

      // Strip out string literals to avoid matching inside values (e.g. title="alt=...")
      const strippedAttributes = attributes.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''")

      if (!/(?:\s|^)alt\s*=/.test(strippedAttributes)) {
        failures.push(`Missing alt attribute in built HTML for ${route} on tag: ${match[0]}`)
      }
    }
  }

  if (failures.length) {
    console.error(`✗ a11y img checks:\n- ${failures.join('\n- ')}`)
    process.exit(1)
  }
  console.log(`✓ a11y img checks passed on ${routes.length} most visited routes.`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
