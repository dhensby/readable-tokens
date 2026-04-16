# Copilot Instructions

## Local development

Use `nvm` to ensure you're running the correct Node.js version. The required version is pinned in `.nvmrc`:

```sh
nvm use
```

## Build, test, and lint

```sh
npm run build        # TypeScript compilation (tsc)
npm test             # Run full test suite (mocha + ts-node)
npm run lint         # ESLint across src/ and test/
npm run coverage     # Tests with nyc coverage (enforces 100% coverage)
```

Run a single test file:

```sh
npx mocha -r ts-node/register test/crc32.ts
```

Run a single test by name:

```sh
npx mocha -r ts-node/register test/crc32.ts --grep "generates a token from a uuid"
```

## Architecture

This library generates human-readable tokens (like GitHub's `ghp_...` or Stripe's `sk_...`) with the format `prefix_encodedPayload`. It is built around two pluggable interfaces:

- **`Encoder`** (`src/encoder/encoder.ts`) — Serializes binary data to/from strings. The default implementation (`BaseXEncoder`) uses base62 via the `base-x` library.
- **`Validator`** (`src/validator/validator.ts`) — Appends/verifies an integrity checksum on encoded token bodies. The default implementation (`Crc32Validator`) computes a CRC32 checksum matching the GitHub token format. No validator is used for the plain `ReadableToken`.

`ReadableTokenGenerator` (`src/token.ts`) is a factory function that composes an `Encoder` and `Validator` into a `TokenGenerator` with `generate()` and `validate()` methods. It is **not** a class — it returns a plain object implementing the `TokenGenerator` interface.

`src/index.ts` wires up the two pre-built token types (`Crc32Token` and `ReadableToken`) and re-exports everything.

## Conventions

- **4-space indentation**, single quotes, trailing commas on multiline, semicolons required (enforced by ESLint).
- **Commit messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. Semantic-release uses these to generate automated releases and changelogs, so correct commit types are critical.
  - `fix` — Bug fixes or behavioural corrections. Triggers a **patch** release.
  - `feat` — New backwards-compatible functionality. Triggers a **minor** release.
  - `feat!` (or any type with `!`) — Breaking changes. Triggers a **major** release.
  - `chore` — Dependency updates, tooling changes, or housekeeping. **Does not trigger a release.**
  - `ci` — Changes to CI pipelines or workflow configuration. **Does not trigger a release.**
  - `style` — Refactoring or stylistic changes that do not change functionality. **Does not trigger a release.**
  - `test` — Changes that only touch test files. **Does not trigger a release.**
  - Only `fix` and `feat` trigger releases. If a change doesn't neatly fit `fix` or `feat` but still needs to be released, use whichever is most appropriate.
- **Commits and merges:**
  - Commits should be atomic and ideally deployable in isolation — all tests, linting, and commitlinting should pass on each individual commit.
  - PRs are merged using a **merge commit** (no squash-merge or rebase-merge). Each commit in the PR history is preserved.
  - To keep branches up to date with the base branch, **rebase** onto it rather than merging it in.
  - All changes must go through a **pull request** — no direct commits to main.
- **Imports:** Use the `type` keyword for type-only imports (e.g., `import type { Foo } from './bar'`). When importing both types and values from the same module, use a single import with inline `type` (e.g., `import { type Foo, bar } from './baz'`).
- Tests use **Mocha + Chai** (`expect` style). Test files mirror source file names and live in `test/`.
- The package targets **Node.js 16+** and is compiled to CommonJS (`dist/`). CI tests against Node 16, 18, 20, 22, and 24.
- Releases are automated via **semantic-release** on the `main` branch.
- **Keeping this file up to date:** If a change affects the architecture, conventions, build process, or any other information documented here, update this file as part of the same PR.
