import assert from 'node:assert/strict'
import test from 'node:test'
import { decideGitGate, findGatedSubcommands } from '../scripts/git-gate.ts'

test('finds git subcommands across chained commands', () => {
  assert.deepEqual(findGatedSubcommands({ command: 'npm test && git add . ; git commit -m "x"\ngit push' }), [
    'add',
    'commit',
    'push',
  ])
})

test('sees through global options, environment assignments and prefixes', () => {
  assert.deepEqual(findGatedSubcommands({ command: 'GIT_PAGER=cat git -C packages/api -c user.name=x commit' }), [
    'commit',
  ])
  assert.deepEqual(findGatedSubcommands({ command: 'sudo /usr/bin/git push origin main' }), ['push'])
})

test('ignores read-only git commands and text that merely mentions git', () => {
  assert.deepEqual(findGatedSubcommands({ command: 'git status && git diff --staged && git log -3' }), [])
  assert.deepEqual(findGatedSubcommands({ command: 'echo git push' }), [])
  assert.deepEqual(findGatedSubcommands({ command: 'grep -r "git commit" docs' }), [])
})

test('allows commands up to the configured level', () => {
  const command = 'git add . && git commit -m "feat: x"'
  assert.equal(decideGitGate({ command, gitLevel: 'commit', isStagingPaused: false }).isAllowed, true)
  assert.equal(decideGitGate({ command, gitLevel: 'push', isStagingPaused: false }).isAllowed, true)
})

test('blocks the first command above the configured level and names both levels', () => {
  const decision = decideGitGate({
    command: 'git add . && git commit -m "feat: x"',
    gitLevel: 'staging',
    isStagingPaused: false,
  })
  assert.equal(decision.isAllowed, false)
  assert.match(decision.reason, /"git commit" needs git level "commit"/)
  assert.match(decision.reason, /set to "staging"/)
})

test('blocks every gated command at level changes', () => {
  assert.equal(decideGitGate({ command: 'git add src', gitLevel: 'changes', isStagingPaused: false }).isAllowed, false)
  assert.equal(decideGitGate({ command: 'git status', gitLevel: 'changes', isStagingPaused: false }).isAllowed, true)
})

test('pause staging blocks staging even when the level would allow it', () => {
  const decision = decideGitGate({ command: 'git add .', gitLevel: 'push', isStagingPaused: true })
  assert.equal(decision.isAllowed, false)
  assert.match(decision.reason, /staging is paused/)
})
