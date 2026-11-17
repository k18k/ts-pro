import { decideCommandControlGate, decideFileControlGate } from './control-gate.ts'
import { readHookInput, readToolInputString } from './hook-input.ts'

// PreToolUse hook for Bash, Edit and Write. Exit code 2 blocks the call and shows stderr to Claude.
const hookInput = await readHookInput()
const command = readToolInputString({ hookInput, field: 'command' })
const decision =
  command === undefined
    ? decideFileControlGate({
        filePath: readToolInputString({ hookInput, field: 'file_path' }) ?? '',
        addedText:
          readToolInputString({ hookInput, field: 'content' }) ??
          readToolInputString({ hookInput, field: 'new_string' }) ??
          '',
        removedText: readToolInputString({ hookInput, field: 'old_string' }) ?? '',
      })
    : decideCommandControlGate({ command })

if (!decision.isAllowed) {
  process.stderr.write(`${decision.reason}\n`)
  process.exitCode = 2
}
