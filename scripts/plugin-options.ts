import { gitLevels, isGitLevel } from './git-gate.ts'

// Claude Code exports each userConfig option to hook processes as CLAUDE_PLUGIN_OPTION_<KEY>.
// This file is the only place that reads them.
export const readPluginOptions = () => {
  const configuredLevel = process.env.CLAUDE_PLUGIN_OPTION_GIT_LEVEL
  return {
    // An unset or unknown level falls back to the most restrictive one.
    gitLevel: isGitLevel(configuredLevel) ? configuredLevel : gitLevels[0],
    isStagingPaused: process.env.CLAUDE_PLUGIN_OPTION_PAUSE_STAGING === 'true',
    writeTests: process.env.CLAUDE_PLUGIN_OPTION_WRITE_TESTS ?? 'true',
    projectDirectory: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
  }
}
