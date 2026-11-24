// The rules themselves live in skills/rules/SKILL.md and load as the ts-pro:rules skill.
// Hook output past Claude Code's size limit reaches Claude only as a short preview, so the
// session notice stays small and points at the skill instead of carrying the rules.
export const renderSessionNotice = ({ notesDirectory }: { notesDirectory: string }) =>
  [
    'ts-pro is active in this project.',
    'Before you write, change or review TypeScript, load the `ts-pro:rules` skill and follow it. Load it once per session; load it again only when its rules are no longer in context, for example after compaction. A task that touches no TypeScript does not need it.',
    `ts-pro notes folder for this project, used only in non-invasive mode: ${notesDirectory}`,
  ].join('\n\n')
