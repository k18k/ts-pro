# Native Node.js with TypeScript

The runtime baseline: Node.js 26+ runs TypeScript 7 source directly, with no build step. When unsure how a Node.js API behaves, read its documentation at https://nodejs.org/api/ instead of guessing.

## Do

- Reach for a `node:` built-in first, and import it with the `node:` prefix.
- Strict ESM: `"type": "module"` in `package.json`.
- Run source directly: `node src/index.ts`, `node --watch` in development, `node --env-file=.env` for configuration.
- Write exact `.ts` extensions in relative imports: `import { loadConfig } from './config.ts'`.
- Use `import type` (or an inline `type` specifier) for anything used only as a type.
- Alias internal paths with `package.json` `"imports"`; keys start with `#`:
  ```json
  { "imports": { "#lib/*.ts": "./src/lib/*.ts" } }
  ```
- Define a package's public entry points with `"exports"`; targets start with `./`. Keep both maps small and explicit.
- Type-check with the IDE's language server or `tsc --noEmit`. Node.js strips types without checking them and ignores `tsconfig.json` at runtime.
- Test with `node:test` and `node:assert/strict` (or `t.assert`), run by `node --test`. Test files are `*.test.ts`.
- Await subtests (`await t.test(...)`); an unawaited subtest is cancelled when its parent finishes.
- Mock through the test context (`t.mock.fn`, `t.mock.method`), which restores itself after the test.
- Check an API's stability before using it. Stability 2 (Stable) is allowed.

## Do not

- No `tsx`, `ts-node`, Babel, SWC, esbuild, Vite or any bundler or transpiler, unless the developer asks.
- No CommonJS: no `require`, `module.exports`, `exports`, `__dirname` or `__filename`. Use `import.meta.dirname` and `import.meta.filename`.
- No dual ESM and CommonJS package setup, unless the developer asks.
- No `compilerOptions.paths`.
- No extensionless imports, and no `.js` extension on an import of a `.ts` file.
- No syntax that needs code generation, because type stripping only erases: `enum`, runtime `namespace`, constructor parameter properties, decorators, `import x = require(...)`. `erasableSyntaxOnly` makes the type checker reject them.
- No `.tsx` files, and no TypeScript inside `node_modules`; Node.js strips neither.
- No type imported as a value (`import { Config }` for a type).
- No experimental (Stability 1.x) or deprecated API without the developer's approval. That includes `node --test --watch`, `--test-global-setup`, `mock.module`, `--experimental-test-module-mocks` and `t.mock.timers`.
- With mocked timers, no timer functions destructured from `node:timers`; use the globals or the default import.
- No runtime dependency the runtime already covers.

## Standing approvals in ts-pro

- `--experimental-test-coverage` is approved; the coverage report is the record of what is untested.
- A linter and a formatter are allowed as dev dependencies, beside `@types/node` and `typescript`. Oxc is preferred; ESLint is acceptable.

## Baseline files

`package.json`:

```json
{
  "type": "module",
  "engines": { "node": ">=26" },
  "scripts": {
    "check": "tsc --noEmit",
    "test": "node --test --experimental-test-coverage",
    "dev": "node --watch src/index.ts",
    "start": "node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "^7.0.2"
  }
}
```

`tsconfig.json`, with `include` adjusted to the project's actual folders:

```jsonc
{
  "include": ["src/**/*.ts", "test/**/*.ts"],
  "compilerOptions": {
    "types": ["node"],
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```
