import { test } from 'node:test'
import * as assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

test('all images on the most visited routes have alt attributes', async () => {
  const routes = [
    'app/page.tsx',
    'app/start/page.tsx',
    'app/assess/page.tsx',
    'components/ScrollStory.tsx' // used in page.tsx
  ]

  for (const route of routes) {
    const filePath = path.join(process.cwd(), route)
    const content = await fs.readFile(filePath, 'utf-8')

    // Check for standard <img> and Next.js <Image> tags
    const imgRegex = /<(?:img|Image)\b[^>]*>/g
    let match

    while ((match = imgRegex.exec(content)) !== null) {
      const tagContent = match[0]
      assert.ok(/(?:\s|^)alt\s*=/.test(tagContent), `Missing alt attribute in ${route} on tag: ${tagContent}`)
    }
  }
})
