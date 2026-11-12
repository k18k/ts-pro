---
name: goal
description: Reach a larger goal in a ts-pro project by splitting it into small tasks and doing them one at a time.
argument-hint: "[the goal]"
disable-model-invocation: true
---

# One goal, many small tasks

Goal: $ARGUMENTS

1. Split the goal into small tasks, each of which leaves the project type-checking and its tests passing. Show the list before starting.
2. Do the tasks in order. Each one follows every step in `${CLAUDE_PLUGIN_ROOT}/skills/task/SKILL.md`; read that file once and apply it per task, including verification, review and git.
3. Stop and report when a task needs a decision only the developer can make, or when a check fails and fixing the source does not resolve it. Do not start the next task on top of a broken one.
4. Finish with one report: tasks done, tasks left, exceptions added.
