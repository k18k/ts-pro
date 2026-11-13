---
name: setup
description: Prepare a project for ts-pro. Records the project's naming conventions and decisions and compares its setup with the native Node.js baseline.
disable-model-invocation: true
---

# Set up ts-pro in this project

1. **Conventions.** Work out how files are named by kind from the existing code and write them to `docs/structure.md` as a short list (`[name].service.ts`: business logic, and so on). Conventions only: never list the files themselves, because the file tree already does. In an empty project, propose a set and ask.
2. **Decisions.** Create `docs/decisions.md` if it is missing. Ask the developer the questions the rules leave to them and record each answer in one line with its reason:
   - What is the product itself, and what around it should be replaceable?
   - For each replaceable part (storage, mail, queue), how wide should support go?
   - Which existing dependencies are deliberate?
3. **Baseline.** Read `${CLAUDE_PLUGIN_ROOT}/skills/rules/references/native-node.md` and compare `package.json` and `tsconfig.json` with its baseline files. Report each difference. Change nothing unless asked: an existing project's setup is not yours to rewrite.
4. **Linter and formatter.** If the project has neither, recommend Oxc for both and offer to add it; check the current Oxc documentation for the package names and configuration instead of relying on memory. If the project already uses ESLint, leave it.
5. **Issue source.** Issue source is **${user_config.issue_source}**. For `folder`, create `${user_config.issues_folder}` if it is missing. For `github`, check that `gh` is installed and authenticated.
6. **Controls.** Tell the developer the settings live in `/config`: Git level (now **${user_config.git_level}**), Pause staging, Writing tests (now **${user_config.write_tests}**), Disadvise subagents and the autonomous task limit.
