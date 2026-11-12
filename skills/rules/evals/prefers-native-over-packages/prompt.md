---
tags: [skill-creator]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

write scripts/checksum.ts: load API_URL from .env, find every .json file under data/ (any depth), sha256 each one, and POST the list of {file, hash} to API_URL + /checksums together with a unique run id and how many days are left until 2027-01-01. add whatever is needed to package.json so i can run it with npm run checksum

Input files: package.json, .env, data/a.json, data/nested/b.json
