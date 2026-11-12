---
name: task
description: Do one small TypeScript task the ts-pro way, from reading the project's conventions through implementation, tests, verification, review and git. Use for any single, well-scoped change in a ts-pro project such as a fix, a small feature or a refactor of one unit.
argument-hint: "[what to do, or an issue reference]"
---

# One task

Task: $ARGUMENTS

Work through these steps in order. The ts-pro rules should already be in context; if they are not, load the `ts-pro:rules` skill first.

1. **Orient.** Read `docs/structure.md` and `docs/decisions.md` if they exist. If they do not, say once that `/ts-pro:setup` creates them, and continue.
2. **Search before writing.** Look for existing functions, schemas, selects and adapters that already do part of the job.
3. **Implement** the smallest change that does the task. If the task needs a decision only the developer can make (how wide an adapter's support goes, a new dependency that is not clearly justified, a change in intended behaviour), ask instead of guessing.
4. **Tests.** Writing tests is **${user_config.write_tests}** for this project; follow the Tests section of the rules for what that means.
5. **Verify.** Run the project's type check and its tests. When something fails, find out why and fix the source.
6. **Review.** Run the `ts-pro:reviewer` agent on your diff. Fix what it finds in lines you wrote; leave the rest.
7. **Git.** The git level is **${user_config.git_level}**. Go exactly that far and no further; a hook blocks anything above it.
   - `changes`: leave the work in the working tree.
   - `staging`: stage the files you changed, by path.
   - `commit`: also make one commit whose message says what changed and why.
   - `push`: also push the current branch.
8. **Report** in a few lines: what changed, any `ts-pro-exception` you added and why, and anything left for the developer.
