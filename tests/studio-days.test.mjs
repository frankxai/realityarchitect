import assert from 'node:assert/strict'
import test from 'node:test'
import { studioDays, dayIntent } from '../lib/programs/studio-days.ts'

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

test('dayIntent extracts paragraphs from Intent sections and ignores other blocks', () => {
  const day = {
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
  assert.equal(dayIntent(day), 'This is the intent. Here is more.')
})

test('dayIntent handles missing sections and empty blocks gracefully', () => {
  assert.equal(dayIntent({ sections: [] }), '')
  assert.equal(dayIntent({ sections: [{ title: 'Intent', blocks: [] }] }), '')
})
