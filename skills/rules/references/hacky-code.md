# Hacky code: the verdicts

The developer's verdict on 71 patterns, by name. Code is shown only where the name alone is unclear. Judge unlisted patterns by the nearest ones.

## Banned: never write it

- **Types:** double cast (`as unknown as X`); `@ts-ignore` and `@ts-expect-error`; casting `JSON.parse` output; `Object.keys(obj) as (keyof typeof obj)[]`; `Record<string, any>` bags; `{} as User` filled in later.
- **Control flow:** `setTimeout(fn, 0)` or any tick skipping; retry in a loop until it works; boolean flag parameters; async callbacks in `forEach` (unawaited promises); `.catch(() => null)`.
- **Values:** `JSON.parse(JSON.stringify(obj))`; meaning packed into a string and read by position (`id.split('_')[1]`); regex that parses HTML, JSON or a URL; loose equality, including `== null`; `delete obj.field` (use `const { password, ...rest } = user`); `rows[0].id` without checking; relying on object key order; hand date arithmetic (use `Temporal`).
- **State and structure:** globals on `globalThis`; patching built-ins or library objects; mutating an argument in a function that looks read-only; a copied block with one line changed; commented-out code; leftover `console.log`; `process.env` read in many files; `let` assigned in branches where one expression would do.
- **Functions and modules:** long optional positional parameter lists; static-only classes used as namespaces; barrel files; `new Date()` or `Math.random()` inside business logic (pass the value in); sequential `await` in a loop when order does not matter; getters with side effects; URLs or paths built by concatenation (use `new URL`, `URLSearchParams`); `setInterval` polling where an event exists.
- **Runtime and tooling:** `eval` and `new Function`; shelling out for something an API does; editing generated code.

## Last resort: only with `// ts-pro-exception: <reason>`

- **Types:** non-null assertion (`user!.email`), but no comment is needed when business logic guarantees the value; `as any` to reach a hidden member, only in tests; lint suppressions.
- **Control flow:** empty `catch`; rethrowing a new error, allowed as long as the cause is kept (log it or pass `{ cause }`); special case for one record (`if (user.id === 'abc123')`); one function switching on a mode string; `process.exit` outside the entry file.
- **Values:** magic numbers; sentinel returns (`-1`, `''`); optional chaining on values that are never null; member names built at runtime (`obj['get' + name]()`); SQL built by concatenation (`[a, b].join()` is tolerated; values still go through parameters).
- **State and structure:** module-level mutable state; private members through brackets (`client['_internal']`); importing a library's internals; `require` inside a function to dodge a circular import; hardcoded URLs, paths or IDs; code switched off with `if (false)` or a dead flag; `new Proxy` (fine in tests, not in production code).
- **Tooling and tests:** `patch-package` or postinstall edits to a dependency; `overrides` in package.json; `--force`, `--legacy-peer-deps`, `--no-verify`; tests that pass only in a certain order.

## Allowed

Throwing to leave nested loops; `await sleep(ms)`; nested ternaries; `NODE_ENV === 'test'` checks; `!!value`, `+text`, `~~num`; raw string comparisons (`status === 'active'`), though a plain constant object is preferred and a TypeScript `enum` is not; `config ?? {}`; `'key' in input`, when done properly and well typed.

`it.skip` or a commented-out test is allowed only while writing tests is switched off.
