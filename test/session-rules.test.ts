import assert from 'node:assert/strict'
import test from 'node:test'
import { renderSessionRules } from '../scripts/session-rules.ts'

test('renders the rules without frontmatter and with the setting filled in', async () => {
  const rules = await renderSessionRules({ writeTests: 'false' })
  assert.ok(rules.startsWith('# ts-pro rules'))
  assert.ok(!rules.includes('${user_config'))
  assert.match(rules, /Writing tests is \*\*false\*\*/)
})

test('points reference links at files that exist', async () => {
  const rules = await renderSessionRules({ writeTests: 'true' })
  assert.match(rules, /\(\/.*skills\/rules\/references\/hacky-code\.md\)/)
  assert.ok(!rules.includes('(references/'))
})
