import { homedir } from 'node:os'
import { isAbsolute, join, relative, resolve } from 'node:path'

// Where decisions and conventions are kept in non-invasive mode. Keyed on the full path,
// so two projects with the same directory name do not share notes.
export const findNotesDirectory = ({ projectDirectory }: { projectDirectory: string }) =>
  join(homedir(), '.claude', 'ts-pro', 'projects', resolve(projectDirectory).replaceAll(/[^a-zA-Z0-9]/g, '-'))

export const isInsideDirectory = ({ directory, filePath }: { directory: string; filePath: string }) => {
  const pathFromDirectory = relative(resolve(directory), resolve(filePath))
  return !pathFromDirectory.startsWith('..') && !isAbsolute(pathFromDirectory)
}

export const decideTraceGate = ({
  filePath,
  addedText,
  projectDirectory,
  issueSource,
  issuesFolder,
}: {
  filePath: string
  addedText: string
  projectDirectory: string
  issueSource: string
  issuesFolder: string
}) => {
  const absolutePath = resolve(projectDirectory, filePath)
  if (!isInsideDirectory({ directory: projectDirectory, filePath: absolutePath })) return { isAllowed: true, reason: '' }
  if (/ts-pro/i.test(addedText)) {
    return {
      isAllowed: false,
      reason: `ts-pro: non-invasive mode is on, so nothing in the project may mention ts-pro. Remove the mention; record an exception in ${join(findNotesDirectory({ projectDirectory }), 'decisions.md')} and in your report instead.`,
    }
  }
  const isIssueFile =
    issueSource === 'folder' &&
    isInsideDirectory({ directory: resolve(projectDirectory, issuesFolder), filePath: absolutePath })
  if (isIssueFile) {
    return {
      isAllowed: false,
      reason:
        'ts-pro: non-invasive mode is on, so issue files may not be written inside the project. Keep the issue in this conversation and tell the developer to set the issues folder outside the project, or the issue source to github or session, in /config.',
    }
  }
  return { isAllowed: true, reason: '' }
}
