import assert from 'node:assert/strict'
import test from 'node:test'
import { renderSessionNotice } from '../scripts/session-rules.ts'

test('points Claude at the ts-pro:rules skill instead of carrying the rules', () => {
  const notice = renderSessionNotice({ notesDirectory: '/notes' })
  assert.match(notice, /load the `ts-pro:rules` skill/)
  assert.ok(!notice.includes('# ts-pro rules'))
})

test('names the notes folder', () => {
  assert.match(renderSessionNotice({ notesDirectory: '/notes/project' }), /\/notes\/project$/)
})

test('stays far below the hook output limit', () => {
  assert.ok(renderSessionNotice({ notesDirectory: '/notes' }).length < 2000)
})
