import { readPluginOptions } from './plugin-options.ts'
import { findNotesDirectory } from './trace-gate.ts'
import { renderSessionNotice } from './session-rules.ts'

// SessionStart hook. It also fires after compaction, so Claude is reminded to load the rules
// again once the earlier conversation is summarised away. Stdout of this hook is added to Claude's context.
const { projectDirectory } = readPluginOptions()

process.stdout.write(`${renderSessionNotice({ notesDirectory: findNotesDirectory({ projectDirectory }) })}\n`)
