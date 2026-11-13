---
name: find-issues
description: Scan a ts-pro project for bugs, technical debt and rule violations and file each one as an issue, without fixing anything.
argument-hint: "[path or area to scan; default is the whole project]"
disable-model-invocation: true
---

# Find issues

Scope: $ARGUMENTS

Find problems and file them. Change no source code.

1. Read the open issues first, so nothing is filed twice. Issue source is **${user_config.issue_source}**: for `folder`, the files in `${user_config.issues_folder}`; for `github`, `gh issue list`; for `session`, the list kept in this conversation.
2. Scan the scope for bugs, for violations of the ts-pro rules (load `ts-pro:rules` and its hacky-code reference if they are not in context), and for places where one change would force edits in many files.
3. Use the tools that already report problems before reading code by eye: the type checker, the linter, the tests with coverage.
4. File one issue per problem. For `folder`, write `<short-kebab-title>.md` in the issues folder; for `github`, use `gh issue create`; for `session`, add it to the numbered list in this conversation. Each issue states:
   - **Where:** file and line.
   - **What:** the problem in one or two sentences, with the evidence.
   - **Why it matters:** the goal or rule it breaks.
   - **Suggested fix:** the smallest change that resolves it.
5. Report the count by kind and the three you would fix first.

Existing violations are in scope here because the developer asked for them. Group repeated instances of one violation into a single issue.
