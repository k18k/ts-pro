export const gitLevels = ['changes', 'staging', 'commit', 'push'] as const

const requiredLevelBySubcommand = {
  add: 'staging',
  stage: 'staging',
  rm: 'staging',
  mv: 'staging',
  commit: 'commit',
  merge: 'commit',
  rebase: 'commit',
  'cherry-pick': 'commit',
  revert: 'commit',
  am: 'commit',
  push: 'push',
} as const satisfies Record<string, (typeof gitLevels)[number]>

const commandSeparators = ['&&', '||', ';', '|', '&', '(', ')', '\n']
const commandPrefixes = new Set(['sudo', 'command', 'env', 'time', 'exec'])
const gitOptionsTakingValue = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path'])

export const isGitLevel = (value: unknown): value is (typeof gitLevels)[number] =>
  gitLevels.some((level) => level === value)

const isGatedSubcommand = (value: string): value is keyof typeof requiredLevelBySubcommand =>
  Object.hasOwn(requiredLevelBySubcommand, value)

const isEnvironmentAssignment = (word: string) => !word.startsWith('-') && word.includes('=')

const isGitBinary = (word: string) => word === 'git' || word.endsWith('/git')

// ts-pro-exception: Node has no shell parser, so the command is split by hand. A separator
// inside quotes splits too, which can only block more than intended, never less.
const splitIntoSimpleCommands = ({ command }: { command: string }) =>
  commandSeparators
    .reduce((text, separator) => text.replaceAll(separator, '\u0000'), command)
    .split('\u0000')
    .map((simpleCommand) => simpleCommand.trim().split(/\s+/))

const findGitSubcommand = ({ words }: { words: string[] }) => {
  const commandWords = words.filter(
    (word, position) =>
      !words.slice(0, position + 1).every((earlier) => isEnvironmentAssignment(earlier) || commandPrefixes.has(earlier)),
  )
  const [binary, ...gitArguments] = commandWords
  if (binary === undefined || !isGitBinary(binary)) return undefined
  return gitArguments.find(
    (word, position) => !word.startsWith('-') && !gitOptionsTakingValue.has(gitArguments[position - 1] ?? ''),
  )
}

export const findGatedSubcommands = ({ command }: { command: string }) =>
  splitIntoSimpleCommands({ command })
    .map((words) => findGitSubcommand({ words }))
    .filter((subcommand) => subcommand !== undefined)
    .filter(isGatedSubcommand)

export const decideGitGate = ({
  command,
  gitLevel,
  isStagingPaused,
}: {
  command: string
  gitLevel: (typeof gitLevels)[number]
  isStagingPaused: boolean
}) => {
  const gatedSubcommands = findGatedSubcommands({ command })
  const [firstGated] = gatedSubcommands
  if (firstGated !== undefined && isStagingPaused) {
    return {
      isAllowed: false,
      reason: `ts-pro: staging is paused so the developer can compare changes. "git ${firstGated}" is blocked. Leave the changes in the working tree and say what you would have staged.`,
    }
  }
  const tooHigh = gatedSubcommands.find(
    (subcommand) => gitLevels.indexOf(requiredLevelBySubcommand[subcommand]) > gitLevels.indexOf(gitLevel),
  )
  if (tooHigh !== undefined) {
    return {
      isAllowed: false,
      reason: `ts-pro: "git ${tooHigh}" needs git level "${requiredLevelBySubcommand[tooHigh]}", and this project is set to "${gitLevel}". Stop at "${gitLevel}" and report what is ready. The developer can raise the level in /config.`,
    }
  }
  return { isAllowed: true, reason: '' }
}
