// The band's copy of the plugin's userConfig fields, under the same names, so a press redraws it.
// The plugin contract must be self-contained, so the option values are written out here and the
// band's arrays are checked against them with `satisfies`.
export type Controls = {
  git_level: 'changes' | 'staging' | 'commit' | 'push'
  pause_staging: boolean
  write_tests: boolean
  non_invasive: boolean
  subagents: 'off' | 'ts-pro' | 'all'
  issue_source: 'folder' | 'github' | 'session'
  band: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'ts-pro': { controls: Controls; isMoreOpen: boolean }
  }
}
