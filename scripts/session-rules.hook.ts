import { readPluginOptions } from './plugin-options.ts'
import { renderSessionRules } from './session-rules.ts'

// SessionStart hook. It also fires after compaction, so the rules are restored when the
// earlier conversation is summarised away. Stdout of this hook is added to Claude's context.
const { writeTests } = readPluginOptions()
const rules = await renderSessionRules({ writeTests })

process.stdout.write(
  `${rules}\n\nThese rules are now in context for this session; do not load the ts-pro:rules skill again.\n`,
)
