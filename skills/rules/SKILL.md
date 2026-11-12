---
name: rules
description: The ts-pro rules for writing, changing and reviewing TypeScript. The plugin already puts these rules in context at session start and after compaction, so load this skill only when they are not in context, for example inside a subagent that writes or reviews TypeScript.
---

# ts-pro rules

Three goals. When a case is not covered, decide by them.

1. **Readable at first glance**, by a reader with little attention to spare.
2. **Minimal technical debt**: nothing a later refactor has to undo.
3. **Changes cascade**: every fact is declared once and everything else is derived, so a change flows down with minimal edits. A second source of truth is banned in code, config and docs. Test: adding a field to `user` touches the schema and the code that uses the field, nothing else.

Each principle comes with a few examples; recognise the other cases yourself.

## Scope

- Follow the rules strictly in what you write. In a repo that already breaks them, do not fix existing violations unless asked, and do not add new ones even where the surrounding code does.
- Stay inside the request. The rules shape how you write what was asked; they are not a reason to add architecture, files, config or scripts nobody asked for. A one-file script stays one file: adapters are for services an application depends on and may replace.
- A rule may be broken only as a last resort, marked `// ts-pro-exception: <reason>` on the line. Unmarked exceptions are violations.

## Conventions (arbitrary, so exact)

- Names say what the function does. Boolean checks are `is...`; checks that throw are `assert...`.
- No explicit return types; inference lets changes cascade. Only exception: `asserts x is T`, and `x is T` predicates the compiler fails to infer.
- No annotation where the type is inferable.
- One parameter per function; more than one value means a single well-typed object. No flag or optional positional parameters.
- `const` by default; `let` only where reassignment is unavoidable.
- Files are named by kind (`x.service.ts`, `x.controller.ts`, `x.z.ts`); the project's kinds are in `docs/structure.md`.
- Comments only for code that looks removable but is not, and for exceptions.
- One job per function, about 30 lines, nesting no deeper than 2.

## Types: one source of truth

- No `any`: take `unknown` and narrow with an `is` or `assert` function.
- With zod, the schema is the definition. No hand-written type for the same shape, and no alias `type User = z.infer<typeof userSchema>`; write `z.infer<typeof userSchema>` inline where a parameter needs it.
- Variants derive from the original (`.pick`, `.omit`, `.extend`); closed sets are one `z.enum` or `as const` array with the union derived. No TypeScript `enum`.
- Types cross layers by inference (row types from the table definition, response types from the handler); no parallel DTO type unless the shape truly differs.
- No loose types at the top of files.
- No type gymnastics. No feature is banned; a reader must be able to say what the type resolves to at first glance.
- Parse untrusted data once, where it enters; past that, functions trust their typed input.

## Structure

- No duplication: search before writing; extract to a shared file on second use, not first.
- Shared database selects instead of repeated column lists.
- Anything that is not the product sits behind a replaceable adapter: a factory passed once at startup, with an in-memory implementation that is the default when none is passed, and one conformance test suite run against every implementation. How wide the support goes is the developer's call, recorded in `docs/decisions.md`; ask if it is missing.
- Functions never receive services as parameters. Adapters are reached through `AsyncLocalStorage`; reading one outside a context throws. Read [references/adapters.md](references/adapters.md) before writing or changing an adapter.
- Services are isolated: no importing another service's internals.

## Native first, zero dependencies as the target

- Runtime baseline: Node.js 26+ runs TypeScript 7 source directly. Strict ESM, exact `.ts` import extensions, `import type`, `#` aliases from `package.json` `"imports"` (never `paths`), `node:test`, stable APIs only. No build step, bundler, `tsx` or `ts-node`; no CommonJS; no syntax that needs code generation (`enum`, `namespace`, parameter properties, decorators). Read [references/native-node.md](references/native-node.md) before setting up a project, changing `package.json` or `tsconfig.json`, or using a Node.js API you are unsure of.
- Dev dependencies are `@types/node`, `typescript`, and a linter and formatter (Oxc preferred, ESLint acceptable). `--experimental-test-coverage` is approved.
- Before adding a package, check in order: the runtime already does it (`fetch`, `--env-file`, `--watch`, `node:crypto`, `fs.glob`, `Temporal`), the project already has it, or it is a few lines to write.
- Justified only when it is the product's core or would be more code to maintain by hand; record it in `docs/decisions.md`.
- If a measurement shows a built-in is the bottleneck, go lower (for example a Rust addon), not to a heavier package. Never on a guess.

## Debt

- No `TODO` without a linked issue. No shims, deprecated wrappers or dead code; a change updates every caller.
- Never keep by hand what a tool already reports: coverage knows what is untested, git what changed, the type checker what is broken, the file tree the structure. `docs/structure.md` holds naming conventions only.

## Tests

- A test pins what the code is meant to do, at every level from unit to integration.
- When a test fails, find out why first; the default fix is in the source.
- Change a test or snapshot only when the intended behaviour changed, and say so (old and new behaviour) before re-snapshotting.
- Never get to green by weakening an assertion, skipping or deleting a test, or regenerating an unread snapshot.
- Writing tests is **${user_config.write_tests}** for this project. When `false`: write no new tests, still run existing ones and fix the source when one fails; only then may a test your change broke be skipped. The runner's skipped count is the record; list it nowhere.

## Hacky code

The developer gave a verdict on 71 named patterns: [references/hacky-code.md](references/hacky-code.md). Read it before writing anything that feels like a shortcut, and when reviewing. The frequent ones:

- **Banned:** double cast, `@ts-ignore`, casting `JSON.parse`, `setTimeout(fn, 0)`, retry-until-it-works, unawaited promises, `.catch(() => null)`, `==`, `delete obj.field`, hand date arithmetic, commented-out code, leftover `console.log`, barrel files, string-built URLs.
- **Last resort (with exception comment):** empty catch, magic number, sentinel return, module-level mutable state, library internals, `patch-package`, `overrides`, `--force`.
