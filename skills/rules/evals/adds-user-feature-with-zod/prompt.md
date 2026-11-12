---
tags: [skill-creator]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

this project already has zod. add a way to create users and fetch one by id. a user has id, email and displayName. keep the storage swappable, i only need it running locally for now but postgres will come later. put everything under src/

Input files: package.json, tsconfig.json, src/main.ts
