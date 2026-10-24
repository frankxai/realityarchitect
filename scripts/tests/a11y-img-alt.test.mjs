import { test } from 'node:test'
import * as assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

test('all images on the most visited routes have alt attributes', async () => {
  const routes = [
    '.next/server/app/index.html',
    '.next/server/app/start.html',
    '.next/server/app/assess.html'
  ]

  for (const route of routes) {
    const filePath = path.join(process.cwd(), route)
    let content
    try {
      content = await fs.readFile(filePath, 'utf-8')
    } catch (error) {
      assert.fail(`Build artifact not found: ${route}. Run 'pnpm build' before testing.`)
    }

    const imgRegex = /<img\b([^>]*)>/g
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      const attributes = match[1]

      // Strip out string literals to avoid matching inside values (e.g. title="alt=...")
      const strippedAttributes = attributes.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''")

      assert.ok(/(?:\s|^)alt\s*=/.test(strippedAttributes), `Missing alt attribute in built HTML for ${route} on tag: ${match[0]}`)
    }
  }
})
