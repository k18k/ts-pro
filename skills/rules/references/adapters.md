# Adapters

The developer's own reference implementation is the katrix server: https://github.com/k18k/katrix/blob/main/packages/server/README.md. What to take from it:

- **Factories passed once.** Each adapter is created by a factory (`memoryAdapter()`, `sqliteAdapter(db)`, `postgresAdapter(pool)`) and handed to the one place that starts the application. Swapping an implementation is changing that one argument.
- **In-memory is the default.** Leave an adapter out and the in-memory one is used, so the application runs locally and in tests with no setup.
- **A small contract.** A few required methods, plus optional ones for capabilities not every backend has (a transaction, a batch read). Say at startup what is lost when an optional one is missing; do not fail silently.
- **Widen support with one generic adapter, not many.** "All SQL databases" is one adapter that takes a dialect and an executor, not a hand-written adapter per database.
- **One conformance suite.** The tests that define correct adapter behaviour are written once and run against every implementation, each on a fresh, empty store. A new adapter is done when it passes them.

## Reaching an adapter through AsyncLocalStorage

The in-memory adapter defines the contract, so the contract has one definition. Other adapters end with `satisfies ReturnType<typeof createMemoryUsersStorage>`.

```ts
// user.z.ts
export const userSchema = z.object({ id: z.string(), email: z.string() })
export const newUserSchema = userSchema.omit({ id: true })

// users-storage.memory.ts
export const createMemoryUsersStorage = () => {
  const users = new Map<string, z.infer<typeof userSchema>>()
  return {
    insert: async ({ newUser }: { newUser: z.infer<typeof newUserSchema> }) => {
      const user = { ...newUser, id: randomUUID() }
      users.set(user.id, user)
      return user
    },
  }
}

// users-storage.context.ts
const usersStorageContext = new AsyncLocalStorage<ReturnType<typeof createMemoryUsersStorage>>()

function assertInsideUsersStorageContext(
  storage: ReturnType<typeof createMemoryUsersStorage> | undefined,
): asserts storage is ReturnType<typeof createMemoryUsersStorage> {
  if (storage === undefined) throw new Error('usersStorage() was called outside runWithUsersStorage()')
}

export const runWithUsersStorage = usersStorageContext.run.bind(usersStorageContext)

export const usersStorage = () => {
  const storage = usersStorageContext.getStore()
  assertInsideUsersStorageContext(storage)
  return storage
}

// user.service.ts — no storage parameter
export const createUser = async (newUser: z.infer<typeof newUserSchema>) => usersStorage().insert({ newUser })

// user.controller.ts — untrusted input is parsed once, here
export const postUser = async ({ body }: { body: unknown }) => createUser(newUserSchema.parse(body))

// main.ts — the adapter is chosen once, at startup
runWithUsersStorage(createMemoryUsersStorage(), startServer)
```
