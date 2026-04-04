# AGENTS.md
This file is for coding agents operating in this repository.

## Repository Overview
- Project name: `LLMOne` (local folder may still be `ModelMachine`).
- Product type: Electron-packaged Next.js application for LLM deployment and system setup workflows.
- Main stack: Bun, Next.js App Router, React 19, TypeScript, Electron, tRPC, Zustand, Jotai, Zod, Tailwind CSS.
- Main source areas:
  - `app/` — routes and screens
  - `components/` — shared UI
  - `lib/` — utilities, env helpers, deploy logic, logging
  - `stores/` — Zustand stores and slices
  - `trpc/` — server/router/client integration
  - `electron/` — main-process entrypoints
  - `sdk/` — SDK helpers and types

## Install / Setup
Use Bun for dependency management:
```bash
bun install
```
CI also downloads a packaged binary dependency before building:
```bash
bun run ./scripts/download-bin.ts
```
CI sets `MXD_PLATFORM`, `MXD_ARCH`, `MXD_RELEASE`, and `GITHUB_TOKEN` for that script. Inspect `.github/workflows/build.yaml` and the script before assuming local defaults.

## Build Commands
Commands defined in `package.json`:
```bash
bun run next:dev
bun run next:build
bun run trpc:dev
bun run trpc:build
bun run electron:dev
bun run electron:build
bun run build
```
Use `next:build` for web-only validation, `electron:build` for desktop packaging, and `build` for the full production build. CI currently runs `bun install`, `bun run ./scripts/download-bin.ts`, and `bun run build`.

## Lint / Format / Type Check
There is no dedicated `lint`, `format`, or `typecheck` script in `package.json`, but these commands match the repo config and are safe defaults:
```bash
bunx eslint .
bunx prettier --check .
bunx prettier --write .
bunx tsc --noEmit
```
Focused variants like `bunx eslint app/connect-info/schemas.ts` and `bunx prettier --check AGENTS.md` are safe. Use `bunx tsc --noEmit` for project-wide type checking; there is no single-file TS check configured here.

## Test Commands
Current repository state:
- No `test` script in `package.json`
- No `tests/` directory
- No Vitest, Jest, Bun test, Playwright, Cypress, or Mocha setup found
So there is currently **no repository-native test command** and **no repository-native single-test command**.
When reporting verification, be explicit:
- Say “no automated test suite is currently configured” instead of inventing a command.
- Use `bunx tsc --noEmit`, `bunx eslint .`, and targeted builds as the available validation steps.

## Single-Test Guidance
There is no current single-test workflow because there is no configured test runner.
If a test runner is added later, update this file with:
1. the top-level test command
2. the exact single-file test command
3. the exact single-test-name command
Until then, do not claim a single test was run unless you also introduced the test tooling in the same change.

## Formatting and Imports
From `.prettierrc.yaml`:
- 2-space indentation
- `printWidth: 120`
- no semicolons
- single quotes
- trailing commas enabled
- arrow parens always
- import sorting via `@ianvs/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`
Configured import order:
1. built-in Node modules; 2. React; 3. Next; 4. third-party; 5. `@/lib/*`; 6. `@/components/*`; 7. other `@/*`; 8. `/` absolute; 9. relative
Repository alias:
```ts
@/* -> ./*
```
Prefer `@/` imports over deep relative paths for project code.

## TypeScript and Validation
- `tsconfig.json` has `strict: true`; keep new code fully typed.
- Prefer explicit domain types and `z.infer<typeof schema>`.
- Avoid `any`; if unavoidable, keep it narrow and documented.
- Validate boundary inputs with Zod, especially in schemas, config parsing, and tRPC routers.
- Prefer small pure helpers over ad hoc mutation.

## Naming Conventions
- Files/folders: kebab-case (`ssh-hosts-confirm.tsx`, `global-store.ts`)
- React components: PascalCase (`TelemetryDialog`, `DialogContent`)
- Hooks: `useXxx`
- Utility functions: descriptive camelCase verbs (`readSettings`, `wrapError`)
- Constants: UPPER_SNAKE_CASE when they are true constants
- Zod schemas: `somethingSchema`
- Zustand helpers: `createXSlice`, `createXStore`

## React / Next / State Conventions
- Use App Router patterns under `app/`.
- Add `'use client'` only when client-only behavior is required.
- Prefer function declarations for components and hooks, matching the current codebase.
- Keep components focused; move shared UI to `components/` and shared logic to `lib/` or `hooks/`.
- Use `cn(...)` for class merging.
- Use Zustand for app/global state under `stores/`, with slice composition for larger stores.
- Use Jotai only where the existing feature already uses it.
- Use tRPC + TanStack Query for server-backed data flows.

## Error Handling and Logging
Match existing patterns in `lib/utils/error.ts`, `lib/settings/index.ts`, and `lib/logger/index.ts`:
- validate early at boundaries
- use `try/catch` around I/O, parsing, network, and filesystem operations
- log operational failures with the Pino-based logger from `@/lib/logger`
- preserve useful messages and wrap with context when rethrowing
- reuse helpers like `wrapError(...)` and `messageError(...)`
- avoid swallowing errors silently
Prefer child loggers with module context when working in a subsystem; the common pattern is “log with context, then rethrow with `wrapError(...)`”.

## Files Usually Not Worth Editing
Avoid hand-editing generated/build output unless the task is explicitly about generated artifacts:
- `.next/`
- `dist-electron/`
- `dist-trpc/`
- `out/`
- `release/`
- `node_modules/`
- `tsconfig.tsbuildinfo`

## ESLint Notes
- ESLint extends `next/core-web-vitals` and `next/typescript`.
- TanStack Query recommended rules are enabled.
- `camelcase` is only a warning; preserve external snake_case fields when required.
- Keep any lint suppression narrow and local.

## Cursor / Copilot Rules
No repository-specific Cursor or Copilot instruction files were found:
- no `.cursor/rules/`
- no `.cursorrules`
- no `.github/copilot-instructions.md`
If any are added later, update this file and treat them as repository-specific agent instructions.

## Recommended Verification Order
For non-trivial code changes, prefer:
1. `bunx prettier --write <changed-files>`
2. `bunx eslint <changed-files-or-project>`
3. `bunx tsc --noEmit`
4. `bun run next:build` for web changes
5. `bun run build` for packaging-sensitive changes
If a command is unavailable or too expensive for the change scope, say exactly what you did run. Keep this file current when commands, tooling, test setup, or repository rules change.
