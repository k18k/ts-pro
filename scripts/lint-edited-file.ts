import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { extname, join } from 'node:path'

// Oxc is the preferred linter; ESLint is used when it is what the project has.
const lintersByPreference = ['oxlint', 'eslint']
const lintableExtensions = new Set(['.ts', '.mts', '.cts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'])

export const isLintable = ({ filePath }: { filePath: string }) => lintableExtensions.has(extname(filePath))

export const findProjectLinter = ({ projectDirectory }: { projectDirectory: string }) =>
  lintersByPreference
    .map((linter) => join(projectDirectory, 'node_modules', '.bin', linter))
    .find((linterPath) => existsSync(linterPath))

export const lintFile = ({ filePath, projectDirectory }: { filePath: string; projectDirectory: string }) => {
  const linterPath = findProjectLinter({ projectDirectory })
  if (linterPath === undefined || !isLintable({ filePath })) return { hasFindings: false, report: '' }
  const result = spawnSync(linterPath, [filePath], { cwd: projectDirectory, encoding: 'utf8' })
  return { hasFindings: result.status !== 0, report: `${result.stdout}${result.stderr}` }
}
