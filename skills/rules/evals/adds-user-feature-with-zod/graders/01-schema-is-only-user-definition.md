---
type: llm
focus: trace
weight: 1
---

A zod schema is the only definition of the user shape: there is no hand-written type or interface for it, and its inferred type is exported once, right below the schema (`export type User = z.infer<typeof userSchema>`), with no second alias elsewhere
