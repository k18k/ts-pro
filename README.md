# ts-pro

A Claude Code plugin for TypeScript coding, code review and vibe coding with low technical debt. It runs as close to native Node.js with TypeScript as possible.

## Install

```bash
claude plugin marketplace add k18k/ts-pro
claude plugin install ts-pro@k18k
```

ts-pro needs no other plugin: the native Node.js baseline ships with it. The hooks are TypeScript files run directly by Node.js, so Node.js 22.18 or later must be on `PATH` (26 or later is the target).

## What it does

**Rules in context, cheaply.** A `SessionStart` hook puts the rules (about 1,050 words) into context when a session starts and again after compaction, so they are not summarised away. Longer material loads only when needed: the verdicts on 71 "hacky" patterns, the adapter pattern and the native Node.js dos and don'ts are separate reference files.

**Controls** sit in a band above the prompt: the git level, pause staging and writing tests as buttons, plus Find issues, Review and Auto. A press takes effect at once and Claude is told the new value. The band needs a Claude Code build with plugin UI modules; **Hide** removes it and the "Band above the prompt" setting brings it back. The same settings are in `/config`:

| Setting | Values | Effect |
| --- | --- | --- |
| Git level | `changes`, `staging`, `commit`, `push` | A hook blocks git commands above the level |
| Pause staging | on, off | Blocks staging, commits and pushes while you compare changes |
| Writing tests | on, off | Whether Claude writes tests for what it changes; existing tests always run |
| Issue source, Issues folder | `folder` or `github` | Where issues are read and filed |
| Autonomous task limit | 1 to 100 | Where autonomous mode stops |

**Work modes** are commands:

| Command | Mode |
| --- | --- |
| `/ts-pro:find-issues [scope]` | Scan and file issues; fixes nothing |
| `/ts-pro:task <what>` | One small task, through tests, verification, review and git |
| `/ts-pro:goal <goal>` | A larger goal split into small tasks |
| `/ts-pro:auto` | Work through open issues until a stop condition |
| `/ts-pro:review [range]` | Fresh-context review of a diff |
| `/ts-pro:setup` | Record the project's conventions and decisions |

**Hooks:**

- `SessionStart`: loads the rules.
- `PreToolUse` on Bash: the git gate.
- `PostToolUse` on Edit and Write: runs the project's linter (Oxc preferred, ESLint if that is what the project has) on the edited file. Does nothing when the project has no linter.

## Limits

- The git gate reads the command text. It is a guard rail, not a sandbox: `bash -c "git push"`, a git alias or `gh pr create` are not recognised.
- The lint hook reports findings for the whole edited file and tells Claude to fix only the lines it touched.

## Development

The rules have one home, `skills/rules/SKILL.md`; the session hook renders that file. The scripts follow the rules they enforce.

```bash
npm install   # @types/node and typescript, for the type check only
npm test             # node:test with coverage: the scripts (test/*.spec.ts)
npm run check
claude plugin test .  # the band (test/*.test.tsx), run by Claude Code's own test runner
claude plugin validate .
```
