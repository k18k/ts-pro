---
name: auto
description: Autonomous mode for a ts-pro project. Works through the known issues one after another until a stop condition is met.
disable-model-invocation: true
---

# Autonomous mode

Work through the project's open issues without waiting for input between them.

**Where the issues are.** Issue source is **${user_config.issue_source}**.

- `folder`: one Markdown file per issue in `${user_config.issues_folder}`. An issue is closed by deleting its file in the same change that resolves it.
- `github`: `gh issue list` for the current repository. Close an issue only at git level `push`; below that, name the issue in your report.

**Loop.** Pick the highest-impact open issue you can finish without a developer decision. Treat it as a goal if it needs several tasks, otherwise as one task, and follow `${CLAUDE_PLUGIN_ROOT}/skills/task/SKILL.md` for each task. Then pick the next.

**Stop when any of these is true:**

- ${user_config.max_auto_tasks} tasks are done.
- A type check or test fails and fixing the source does not resolve it. Leave that work in the working tree, unstaged, and describe the failure.
- Every remaining issue needs a developer decision.
- No open issues remain.

Never raise the git level, skip a hook, or change a setting to keep going.

**Final report:** issues resolved, issues skipped and why, the stop condition that ended the run, exceptions added.
