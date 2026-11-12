import { decideGitGate } from './git-gate.ts'
import { readHookInput, readToolInputString } from './hook-input.ts'
import { readPluginOptions } from './plugin-options.ts'

// PreToolUse hook for Bash. Exit code 2 blocks the command and shows stderr to Claude.
const command = readToolInputString({ hookInput: await readHookInput(), field: 'command' })
const { gitLevel, isStagingPaused } = readPluginOptions()
const decision = decideGitGate({ command: command ?? '', gitLevel, isStagingPaused })

if (!decision.isAllowed) {
  process.stderr.write(`${decision.reason}\n`)
  process.exitCode = 2
}
