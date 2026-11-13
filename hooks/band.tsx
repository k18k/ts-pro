import { atom, read, update } from 'claude-code'
import type { PluginOptions, Register } from 'claude-code'

import { gitLevels, isGitLevel } from '../scripts/git-gate.ts'
import type { Controls } from '../types'

export const subagentModes = ['off', 'ts-pro', 'all'] as const

const nextSubagentMode = ({ mode }: { mode: Controls['subagents'] }) =>
  subagentModes[(subagentModes.indexOf(mode) + 1) % subagentModes.length]

// The band above the prompt. The settings themselves live in the plugin's userConfig, which
// the command hooks and skills read; a press writes there, and this copy only redraws the band.
const readControls = ({ options }: { options: PluginOptions }) => ({
  git_level: isGitLevel(options.git_level) ? options.git_level : gitLevels[0],
  pause_staging: options.pause_staging === true,
  write_tests: options.write_tests !== false,
  non_invasive: options.non_invasive === true,
  subagents: subagentModes.find((mode) => mode === options.subagents) ?? subagentModes[0],
  band: options.band !== false,
})

const subagentAdvice = {
  off: 'no preference.',
  'ts-pro': "the developer would rather you did not start ts-pro's own agents, such as ts-pro:reviewer; do that work inline.",
  all: 'the developer would rather you did not start any subagent; do the work inline unless they ask for one.',
} satisfies Record<Controls['subagents'], string>

const subagentLabels = {
  off: 'subagents ok',
  'ts-pro': 'no ts-pro agents',
  all: 'no subagents',
} satisfies Record<Controls['subagents'], string>

const nonInvasiveAdvice = [
  'on. Leave no trace of ts-pro in the project.',
  '  Write no `ts-pro-exception` comments; list each exception in your report and in the decisions file below instead.',
  '  Where the rules or skills name `docs/decisions.md` or `docs/structure.md`, use the files of the same name in `~/.claude/ts-pro/projects/<project directory name>/`.',
  '  Create no issue files inside the project; an issues folder must be outside it, or the issue source `github` or `session`.',
  '  Do not mention ts-pro in code, commits, docs or comments.',
].join('\n')

const describeControls = ({ controls }: { controls: Controls }) =>
  [
    'ts-pro controls, as the developer has them set now. They replace any value stated earlier in this conversation.',
    `- Git level: ${controls.git_level}. Go exactly that far and no further.`,
    `- Staging: ${controls.pause_staging ? 'paused. Stage, commit and push nothing; leave the work in the working tree.' : 'not paused.'}`,
    `- Writing tests: ${controls.write_tests ? 'on.' : 'off. Write no new tests; still run the existing ones.'}`,
    `- Subagents: ${subagentAdvice[controls.subagents]}`,
    `- Non-invasive mode: ${controls.non_invasive ? nonInvasiveAdvice : 'off.'}`,
  ].join('\n')

export const register: Register = (on, options) => {
  const configured = readControls({ options })
  const controls = atom({ plugin: 'ts-pro', key: 'controls' } as const, configured)

  // Runs again after a reload, which is how a change made in /config reaches the band.
  on('session.start', async ($, e, next) => {
    await update($, controls, () => configured)
    return next(e)
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)
    const text = describeControls({ controls: await read($, controls) })
    return { sections: [...composed.sections, { id: 'ts-pro:controls', text, scope: 'session' }] }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, controls)
    if (e.props.hasSurvey || !current.band) return next(e)
    // Other plugins share this slot; theirs is drawn below, not replaced.
    const below = await next(e).catch(() => undefined)
    const { Box, Button, Text } = $.ui.resolve(e)
    const runCommand = ({ command }: { command: string }) => $.command.run({ command, args: '' })
    const setControl = async <Field extends keyof Controls>({ field, value }: { field: Field; value: Controls[Field] }) => {
      const result = await $.config.set({ key: `ts-pro.${field}`, value })
      if (result.deny !== undefined) return $.ui.toast(`ts-pro: ${result.deny}`)
      await update($, controls, (latest) => ({ ...latest, [field]: value }))
    }

    return (
      <Box flexDirection="column">
        <Box
          flexDirection="row"
          alignItems="center"
          gap={1}
          width={e.surface === 'terminal' ? e.props.bodyColumns : undefined}
        >
          <Text dimColor>git</Text>
          {gitLevels.map((level) => (
            <Button
              key={`git-${level}`}
              label={level}
              {...(level === current.git_level
                ? { variant: 'primary' as const }
                : { plain: true as const, dimColor: true })}
              onPress={() => setControl({ field: 'git_level', value: level })}
            />
          ))}
          <Button
            key="pause-staging"
            label={current.pause_staging ? 'staging paused' : 'pause staging'}
            {...(current.pause_staging ? { variant: 'primary' as const } : { plain: true as const, dimColor: true })}
            onPress={() => setControl({ field: 'pause_staging', value: !current.pause_staging })}
          />
          <Button
            key="write-tests"
            label={current.write_tests ? 'tests on' : 'tests off'}
            {...(current.write_tests ? { variant: 'primary' as const } : { plain: true as const, dimColor: true })}
            onPress={() => setControl({ field: 'write_tests', value: !current.write_tests })}
          />
          <Button
            key="subagents"
            label={subagentLabels[current.subagents]}
            {...(current.subagents === 'off' ? { plain: true as const, dimColor: true } : { variant: 'primary' as const })}
            onPress={() => setControl({ field: 'subagents', value: nextSubagentMode({ mode: current.subagents }) })}
          />
          <Button
            key="non-invasive"
            label={current.non_invasive ? 'non-invasive' : 'invasive ok'}
            {...(current.non_invasive ? { variant: 'primary' as const } : { plain: true as const, dimColor: true })}
            onPress={() => setControl({ field: 'non_invasive', value: !current.non_invasive })}
          />
          <Box flexGrow={1} />
          <Button key="find-issues" plain label="Find issues" onPress={() => runCommand({ command: 'ts-pro:find-issues' })} />
          <Button key="review" plain label="Review" onPress={() => runCommand({ command: 'ts-pro:review' })} />
          <Button key="auto" plain label="Auto" onPress={() => runCommand({ command: 'ts-pro:auto' })} />
        </Box>
        {below}
      </Box>
    )
  }).catch(($, e, next) => next(e))
}
