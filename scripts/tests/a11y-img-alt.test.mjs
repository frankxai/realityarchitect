import { test } from 'node:test'
import * as assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

test('all images on the most visited routes have alt attributes', async () => {
  const routes = [
    'app/page.tsx',
    'app/start/page.tsx',
    'app/assess/page.tsx',
    'components/ScrollStory.tsx',
    'components/Assessment.tsx',
    'components/EmailCapture.tsx',
    'components/ArchitectLoopMap.tsx'
  ]

  for (const route of routes) {
    const filePath = path.join(process.cwd(), route)
    const content = await fs.readFile(filePath, 'utf-8')

    // Check for standard <img> and Next.js <Image> tags, correctly allowing for generic matching ignoring early closing angle brackets from jsx
    const imgRegex = /<(?:img|Image)\b(?:[^>'"]|"[^"]*"|'[^']*'|{[^}]*})*>/g
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      const tagContent = match[0]

      // Strip out string and expression literals to only check actual attribute names
      const strippedTagContent = tagContent.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''").replace(/{[^}]*}/g, '{}')

      assert.ok(/(?:\s|^)alt\s*=/.test(strippedTagContent), `Missing alt attribute in ${route} on tag: ${tagContent}`)
    }
  }
})
