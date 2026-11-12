import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const rulesDirectory = join(import.meta.dirname, '..', 'skills', 'rules')

// The rules have one home, skills/rules/SKILL.md. This renders that file for the session
// context: frontmatter dropped, the setting filled in, reference links made absolute.
export const renderSessionRules = async ({ writeTests }: { writeTests: string }) => {
  const skillFile = await readFile(join(rulesDirectory, 'SKILL.md'), 'utf8')
  const [, ...bodyParts] = skillFile.split('\n---\n')
  return bodyParts
    .join('\n---\n')
    .replaceAll('${user_config.write_tests}', writeTests)
    .replaceAll('(references/', `(${rulesDirectory}/references/`)
    .trim()
}
