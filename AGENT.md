# AGENTS.md — Agent Guidance for `flop`

> This file provides guidance for AI coding agents (Antigravity, Codex, Claude, Gemini, etc.)
> working on this repository. Read it fully before making any changes.

---

## Project Overview

**flop** is a React + TypeScript single-page application (SPA) that performs IEEE 754-style
floating-point conversions. It supports FP32, FP64, FP16, bfloat16, TensorFloat-32, and
arbitrary custom formats.

- **Live site**: <https://flop.evanau.dev>
- **Package manager**: `yarn` (do **not** use `npm`)
- **Bundler / framework**: Create React App (`react-scripts 4`)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: `styled-components` v5 — no plain CSS files, no Tailwind

---

## Repository Structure

```
flop/
├── public/                  # Static assets served as-is
├── src/
│   ├── App.tsx              # Root component; handles routing and tab state
│   ├── App.test.tsx         # Smoke test for the root component
│   ├── constants.ts         # All app-wide constants, colour tokens, and format definitions
│   ├── index.tsx            # React DOM entry point
│   ├── reportWebVitals.ts   # Web Vitals reporting (boilerplate)
│   ├── react-app-env.d.ts   # CRA type shim
│   ├── setupTests.ts        # Jest / @testing-library setup
│   ├── converter/           # Core logic + converter UI components
│   │   ├── flop.ts          # ★ Core conversion library (all maths lives here)
│   │   ├── Panel.tsx        # Input/output panel (decimal ↔ binary ↔ hex)
│   │   ├── BitPanel.tsx     # Bit-level visual display
│   │   ├── BitSegment.tsx   # Individual bit segment (sign / exponent / significand)
│   │   ├── ConfigPanel.tsx  # Rounding mode & notation selector
│   │   ├── FormatConverter.tsx     # Converter for a fixed predefined format
│   │   └── CustomFormatConverter.tsx # Converter with user-defined exponent/significand widths
│   ├── hooks/
│   │   └── useLocalStorage.ts  # Generic localStorage hook
│   └── ui/
│       ├── About.tsx        # ★ About page showing app info and acknowledgements
│       ├── Header.tsx       # App title bar
│       ├── TabBar.tsx       # Format-selector tabs
│       └── Footer.tsx       # Acknowledgements & build info
├── .github/
│   └── workflows/
│       ├── main.yml         # CI: lint + format-check + tests on push/PR to main
│       └── release.yml      # CI + CD: deploy to GitHub Pages on release
├── package.json             # Scripts, ESLint config, lint-staged config
├── tsconfig.json            # TypeScript compiler options (strict, esnext, react-jsx)
└── yarn.lock                # Lockfile — commit all changes to this file
```

---

## Key Domain Concepts

Understanding these before touching `flop.ts` is critical.

| Concept        | Description                                                                |
| -------------- | -------------------------------------------------------------------------- |
| `Flop`         | Unbounded-precision decimal value (`{ type: FlopType, value: BigNumber }`) |
| `Flop754`      | IEEE 754 representation (`{ type, sign, exponent, significand }`)          |
| `FlopType`     | `NORMAL \| POSITIVE_INFINITY \| NEGATIVE_INFINITY \| NAN`                  |
| `Flop754Type`  | Adds `SUBNORMAL` to the above                                              |
| Exponent bias  | `2^(width-1) - 1`, computed by `getExponentBias(width)`                    |
| Exponent range | Min/max biased exponents from `getExponentRange(width)`                    |
| Rounding modes | `ROUNDING_MODE.halfToEven` (default) and `ROUNDING_MODE.towardZero`        |
| BigNumber      | All arithmetic uses `bignumber.js` configured to 3 000 decimal places      |

### Conversion flow

```
User decimal string
      │
      ▼
  generateFlop()           ← decimal string → Flop
      │
      ▼
  convertFlopToFlop754()   ← Flop + format widths + rounding → Flop754
      │
      ▼
  deconstructFlop754()     ← Flop754 → { sign[], exponent[], significand[] }  (bits)
      │
      ▼
  BitPanel / Panel         ← render bits, hex, decimal back-conversion
```

The reverse path (bits → decimal) uses `generateFlop754()` → `convertFlop754ToFlop()`.

---

## Adding a New Predefined Format

1. **`src/constants.ts`** — add a new format object, e.g.:
   ```ts
   export const FP8 = {
     name: "FP8",
     exponentWidth: 4,
     significandWidth: 3,
     urlPath: "/fp8-converter",
     pageTitle: "FP8 Converter",
     // Optionally: description, referenceUrl
   };
   ```
2. Append it to the `FORMATS` array in the same file.
3. No changes to routing or `App.tsx` are needed — it is driven entirely by `FORMATS`.
4. Run the test suite to verify nothing regressed.

---

## Development Commands

All commands use `yarn`. **Never** substitute `npm run`.

| Command                      | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `yarn install`               | Install dependencies                                      |
| `yarn start`                 | Start dev server at <http://localhost:3000> (hot-reload)  |
| `yarn test`                  | Run Jest in interactive watch mode                        |
| `yarn test --watchAll=false` | Run Jest once (CI mode)                                   |
| `yarn lint`                  | Auto-fix ESLint issues                                    |
| `yarn lint-check src`        | Check without fixing (used in CI)                         |
| `yarn pretty`                | Auto-format with Prettier                                 |
| `yarn pretty-check .`        | Check formatting without fixing (used in CI)              |
| `yarn build`                 | Production build to `build/`                              |
| `yarn deploy`                | Build + publish to GitHub Pages (requires `GITHUB_TOKEN`) |

---

## Code Style & Constraints

### TypeScript

- **Strict mode is on** — no `any`, no `ts-ignore`, no implicit `any`.
- All exported functions must have explicit return types.
- Prefer `interface` over `type` for object shapes; use `type` for unions/aliases.

### Imports

- Import order is enforced by `eslint-plugin-simple-import-sort`.
  The pre-commit hook (`lint-staged`) will reorder automatically.
- Do not use barrel `index.ts` re-exports inside `src/converter/` — import directly.

### Styling

- All styles live inside the component file via `styled-components`.
- Use colour/font constants from `src/constants.ts` (e.g. `ACCENT_COLOR`, `BACKGROUND_COLOR`,
  `MAIN_FONT_FAMILY`, `MONOSPACED_FONT_FAMILY`). Never hard-code hex values in components.
- Do not add any CSS files, Tailwind, or other CSS-in-JS libraries.

### Testing

- Tests live alongside source files (e.g. `App.test.tsx`).
- Use `@testing-library/react` + `@testing-library/jest-dom`.
- Each meaningful pure function in `flop.ts` should have a corresponding unit test.
- The pre-existing smoke test in `App.test.tsx` must always pass.

---

## Environment Variables

Set automatically during `yarn start` / `yarn build` via the `env` script:

| Variable            | Value                                 | Usage                             |
| ------------------- | ------------------------------------- | --------------------------------- |
| `REACT_APP_VERSION` | `package.json` version                | Displayed in Footer               |
| `REACT_APP_GIT_SHA` | Short git SHA                         | Displayed in Footer as build link |
| `NODE_ENV`          | `test` / `development` / `production` | Standard environment mode         |

Do **not** create a `.env` file that overrides these.

---

## CI / CD

| Trigger                              | Jobs                                  |
| ------------------------------------ | ------------------------------------- |
| Push or PR to `main`                 | Prettier check → ESLint check → Tests |
| GitHub Release (publish/edit/delete) | Same checks + deploy to GitHub Pages  |

The CI must be green before merging. If you create a PR, ensure:

```sh
yarn pretty-check .   # passes
yarn lint-check src   # passes
yarn test --watchAll=false  # passes
```

---

## Known TODOs (from source comments)

These are documented technical debts — do not silently "fix" them without understanding the
full impact and adding a test:

| File                     | TODO                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| `converter/flop.ts` L178 | `deconstructFlop754` assumes significand in Flop754 fits the width                |
| `converter/flop.ts` L258 | `convertFlopToFlop754` — cleanup and optimize                                     |
| `converter/flop.ts` L301 | Rounding dispatch is described as an "abomination"                                |
| `converter/flop.ts` L334 | FlopType override at end of `convertFlopToFlop754` — verify necessity             |
| `converter/flop.ts` L363 | `calculateError` does not handle non-normal numbers                               |
| `converter/flop.ts` L466 | `roundHalfToEven` / `roundTowardInfinity` / `roundTowardZero` need docs & cleanup |

---

## Git Workflow

### Remotes

| Remote      | URL                                               | Role                              |
| ----------- | ------------------------------------------------- | --------------------------------- |
| `origin`    | `git@github.com-chipmonthly:chipmonthly/flop.git` | Your fork — push here             |
| `afterdusk` | `git@github.com-chipmonthly:afterdusk/flop.git`   | Upstream — fetch only, never push |

### Branch Model

| Branch                        | Purpose                                               | Push target               |
| ----------------------------- | ----------------------------------------------------- | ------------------------- |
| `main`                        | Stable, CI-green, deployed to GitHub Pages on release | `origin/main` via PR only |
| `dev`                         | Active development integration branch                 | `origin/dev`              |
| `feature/<short-description>` | One branch per feature or bug fix                     | `origin/feature/…`        |

**Always branch from `dev`**, not from `main`:

```sh
git checkout dev
git pull origin dev
git checkout -b feature/my-feature
```

**Never commit directly to `main`.** All changes to `main` go through a PR from `dev`
(or a feature branch) after CI passes.

### Commit Conventions

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <short imperative summary>

[optional body — explain *why*, not *what*]

[optional footer: BREAKING CHANGE, Closes #<issue>]
```

**Allowed types:**

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature or user-visible behaviour            |
| `fix`      | Bug fix                                          |
| `refactor` | Code restructuring with no behaviour change      |
| `test`     | Adding or updating tests only                    |
| `chore`    | Tooling, dependencies, config (no src change)    |
| `docs`     | Documentation only (AGENTS.md, README, comments) |
| `style`    | Formatting only (Prettier, import order)         |

**Scope** (optional but encouraged): `core`, `ui`, `constants`, `hooks`, `ci`.

**Examples:**

```
feat(constants): add FP8_E5M2 and FP8_E4M3 format definitions
fix(core): handle subnormal rounding edge case in roundHalfToEven
test(core): add unit tests for FP4 E2M1 bit-width invariant
docs: update AGENTS.md with git workflow guidance
```

**Subject line rules:**

- 72 characters or fewer.
- Imperative mood: "add", "fix", "remove" — not "added", "fixes", "removing".
- No trailing period.
- Do **not** reference internal agent names or AI tool names.

### Pre-Commit Hook

The project uses `simple-git-hooks` + `lint-staged`. On every `git commit` the hook
automatically runs:

- `yarn pretty` — Prettier formats staged `*.{js,jsx,ts,tsx,md,json,html,css,yml}` files.
- `yarn lint` — ESLint auto-fixes staged `*.{js,jsx,ts,tsx}` files.

**Do not bypass** the hook (`--no-verify`). If the hook fails, fix the reported issues
before committing.

If the hook is not yet installed in your local checkout (e.g. after a fresh clone),
initialise it once:

```sh
yarn install   # simple-git-hooks installs via postinstall
```

### Syncing With Upstream

Periodically pull upstream changes into `dev` to stay current:

```sh
git fetch afterdusk
git checkout dev
git merge afterdusk/main   # or --rebase if the history is linear
```

Resolve any conflicts, re-run the CI checks, then push:

```sh
git push origin dev
```

### Typical Feature Workflow

```sh
# 1. Start from a clean, up-to-date dev branch
git checkout dev && git pull origin dev

# 2. Create a feature branch
git checkout -b feature/fp8-formats

# 3. Make changes, commit in logical, atomic units
git add src/constants.ts src/converter/flop.formats.test.ts
git commit -m "feat(constants): add FP8_E5M2 and FP8_E4M3 format definitions"

# 4. Keep the branch up to date (rebase preferred over merge for feature branches)
git fetch origin
git rebase origin/dev

# 5. Run the full CI gate locally before pushing
yarn pretty-check .
yarn lint-check src
yarn test --watchAll=false

# 6. Push and open a Pull Request targeting `dev`
git push origin feature/fp8-formats
```

### Pull Request Checklist

Before opening (or requesting review on) a PR:

- [ ] Branch is rebased onto the latest `origin/dev` (no stale merge commits).
- [ ] All commits follow the Conventional Commits format.
- [ ] `yarn pretty-check .` passes locally.
- [ ] `yarn lint-check src` passes locally.
- [ ] `yarn test --watchAll=false` passes locally.
- [ ] PR description explains **what** changed and **why** (not just a list of files).
- [ ] No unrelated files are staged (check `git diff --name-only HEAD~1`).

### Commit Granularity

- One logical change per commit. Do not bundle unrelated fixes.
- A commit should leave the repo in a buildable, test-passing state on its own.
  (This enables `git bisect` to work reliably.)
- Prefer multiple small commits over one giant commit; squash only if the history
  is genuinely noisy (e.g. "wip", "typo", "fix previous fix").

### Tagging & Releases

Only the project maintainer creates tags and GitHub Releases. Agents must not:

```sh
git tag          # ← do not create tags
git push --tags  # ← do not push tags
```

A GitHub Release triggers the `release.yml` CD workflow that deploys to GitHub Pages.

---

## What NOT to Do

- ❌ Do not run `npm install` or `npm run <script>` — use `yarn` only.
- ❌ Do not `yarn eject` — the CRA config is intentionally unexposed.
- ❌ Do not add `console.log` statements to production code.
- ❌ Do not add new third-party libraries without first checking if the task can be done
  with `bignumber.js` or native browser APIs.
- ❌ Do not modify `yarn.lock` by hand.
- ❌ Do not bypass the pre-commit hook with `git commit --no-verify`.
- ❌ Do not store state in global variables — use React state, hooks, or `localStorage` via
  the `useLocalStorage` hook.
- ❌ Do not commit directly to `main` — all changes must go through a PR.
- ❌ Do not `git push --force` to `main` or `dev`; force-push only to your own feature branches
  and only when explicitly rebasing.
- ❌ Do not create or push git tags — tagging is the maintainer's responsibility.
- ❌ Do not commit build artifacts (`build/`), IDE config, or OS files (`.DS_Store`).
- ❌ Do not reference AI tool names ("Antigravity", "Codex", "Claude", etc.) in commit
  messages, PR descriptions, or code comments.

---

## Quick Checklist Before Submitting Changes

**Code quality**

- [ ] `yarn pretty-check .` passes (no formatting violations)
- [ ] `yarn lint-check src` passes (no lint errors)
- [ ] `yarn test --watchAll=false` passes (all tests green, coverage not regressed)
- [ ] New predefined formats are appended to `FORMATS` in `constants.ts`
- [ ] New constants use `SCREAMING_SNAKE_CASE` and are exported from `constants.ts`
- [ ] New styled-components use colour/font tokens from `constants.ts`
- [ ] TypeScript strict mode still compiles (`yarn build` succeeds)

**Git hygiene**

- [ ] Working on a feature branch branched from `dev` (not `main`)
- [ ] All commit messages follow Conventional Commits format
- [ ] No unrelated files are staged (`git status` is clean)
- [ ] Branch is rebased onto latest `origin/dev` (no stale merge commits)
- [ ] `yarn.lock` changes (if any) are committed alongside `package.json` changes
- [ ] No generated files (`build/`, `.DS_Store`, coverage reports) are staged
