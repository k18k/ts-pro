import { readHookInput, readToolInputString } from './hook-input.ts'
import { lintFile } from './lint-edited-file.ts'
import { readPluginOptions } from './plugin-options.ts'

// PostToolUse hook for Edit and Write. Exit code 2 shows stderr to Claude.
const filePath = readToolInputString({ hookInput: await readHookInput(), field: 'file_path' })
const { projectDirectory } = readPluginOptions()
const { hasFindings, report } = lintFile({ filePath: filePath ?? '', projectDirectory })

if (hasFindings) {
  process.stderr.write(
    `${report}\nts-pro: fix the findings on lines you wrote or changed. Leave findings on lines you did not touch; existing violations are fixed only when the developer asks.\n`,
  )
  process.exitCode = 2
}
