import assert from 'node:assert/strict'
import test from 'node:test'
import { studioDays } from '../lib/programs/studio-days.ts'

test('studioDays maps day properties properly and extracts the intent', () => {
  const input = [
    {
      day: 1,
      title: 'First Day',
      minutes: 10,
      sections: [
        { title: 'The intent', blocks: [{ kind: 'paragraph', text: 'To begin.' }] }
      ]
    },
    {
      day: 2,
      title: 'Second Day',
      minutes: 15,
      sections: []
    }
  ]
  const result = studioDays(input)
  assert.deepEqual(result, [
    { day: 1, title: 'First Day', minutes: 10, intent: 'To begin.' },
    { day: 2, title: 'Second Day', minutes: 15, intent: '' }
  ])
})

test('studioDays extracts paragraphs from Intent sections and ignores other blocks', () => {
  const day = {
    day: 1,
    title: 'First Day',
    minutes: 10,
    sections: [
      {
        title: 'Today’s Intent',
        blocks: [
          { kind: 'paragraph', text: 'This is the intent.' },
          { kind: 'list', items: ['Not a paragraph'] },
          { kind: 'paragraph', text: 'Here is more.' }
        ]
      },
      {
        title: 'Other',
        blocks: [{ kind: 'paragraph', text: 'Ignored.' }]
      }
    ]
  }
  assert.equal(studioDays([day])[0].intent, 'This is the intent. Here is more.')
})

test('studioDays returns empty intent when no intent section or paragraphs exist', () => {
  for (const sections of [[], [{ title: 'Intent', blocks: [] }]]) {
    const day = { day: 1, title: 'First Day', minutes: 10, sections }
    assert.equal(studioDays([day])[0].intent, '')
  }
})
