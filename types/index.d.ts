// The band's copy of the plugin's userConfig fields, under the same names, so a press redraws it.
export type Controls = {
  git_level: 'changes' | 'staging' | 'commit' | 'push'
  pause_staging: boolean
  write_tests: boolean
  non_invasive: boolean
  subagents: (typeof import('../hooks/band.tsx').subagentModes)[number]
  band: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'ts-pro': { controls: Controls }
  }
}
