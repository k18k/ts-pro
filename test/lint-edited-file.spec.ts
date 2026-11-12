import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { findProjectLinter, isLintable, lintFile } from '../scripts/lint-edited-file.ts'

const createProjectWithLinter = async ({ linter, script }: { linter: string; script: string }) => {
  const projectDirectory = await mkdtemp(join(tmpdir(), 'ts-pro-'))
  const binDirectory = join(projectDirectory, 'node_modules', '.bin')
  await mkdir(binDirectory, { recursive: true })
  await writeFile(join(binDirectory, linter), script)
  await chmod(join(binDirectory, linter), 0o755)
  return projectDirectory
}

test('lints only source files', () => {
  assert.equal(isLintable({ filePath: 'src/user.service.ts' }), true)
  assert.equal(isLintable({ filePath: 'README.md' }), false)
})

test('does nothing in a project without a linter', async () => {
  const projectDirectory = await mkdtemp(join(tmpdir(), 'ts-pro-'))
  assert.equal(findProjectLinter({ projectDirectory }), undefined)
  assert.deepEqual(lintFile({ filePath: 'src/a.ts', projectDirectory }), { hasFindings: false, report: '' })
})

test('reports findings when the project linter fails', async () => {
  const projectDirectory = await createProjectWithLinter({
    linter: 'oxlint',
    script: '#!/bin/sh\necho "no-explicit-any: $1"\nexit 1\n',
  })
  assert.deepEqual(lintFile({ filePath: 'src/a.ts', projectDirectory }), {
    hasFindings: true,
    report: 'no-explicit-any: src/a.ts\n',
  })
})

test('prefers oxlint over eslint and passes clean files', async () => {
  const projectDirectory = await createProjectWithLinter({ linter: 'eslint', script: '#!/bin/sh\nexit 1\n' })
  const binDirectory = join(projectDirectory, 'node_modules', '.bin')
  await writeFile(join(binDirectory, 'oxlint'), '#!/bin/sh\nexit 0\n')
  await chmod(join(binDirectory, 'oxlint'), 0o755)
  assert.equal(lintFile({ filePath: 'src/a.ts', projectDirectory }).hasFindings, false)
})
