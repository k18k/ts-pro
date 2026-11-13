import { readHookInput, readToolInputString } from './hook-input.ts'
import { readPluginOptions } from './plugin-options.ts'
import { decideTraceGate } from './trace-gate.ts'

// PreToolUse hook for Edit and Write. Exit code 2 blocks the write and shows stderr to Claude.
const hookInput = await readHookInput()
const { isNonInvasive, projectDirectory, issueSource, issuesFolder } = readPluginOptions()
const decision = isNonInvasive
  ? decideTraceGate({
      filePath: readToolInputString({ hookInput, field: 'file_path' }) ?? '',
      addedText:
        readToolInputString({ hookInput, field: 'content' }) ??
        readToolInputString({ hookInput, field: 'new_string' }) ??
        '',
      projectDirectory,
      issueSource,
      issuesFolder,
    })
  : { isAllowed: true, reason: '' }

if (!decision.isAllowed) {
  process.stderr.write(`${decision.reason}\n`)
  process.exitCode = 2
}
