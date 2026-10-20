# Code Quality, Linting, and Git Hooks Guide (LINT.md)

Welcome to the comprehensive code quality guide for this Turborepo full-stack monorepo. This document details how code standards, static analysis, formatting, and Git commit gates are configured, enforced, and verified across both the frontend and backend applications using **Lefthook**, **ESLint 9 (Flat Config)**, **Prettier**, and **GitHub Actions**.

---

## Table of Contents

1. [A. Overview of the Code Quality System](#a-overview-of-the-code-quality-system)
2. [B. Project Structure](#b-project-structure)
3. [C. Lefthook and Pre-Commit Hooks](#c-lefthook-and-pre-commit-hooks)
4. [D. Frontend ESLint Configuration](#d-frontend-eslint-configuration)
5. [E. Backend ESLint Configuration](#e-backend-eslint-configuration)
6. [F. Advanced ESLint Rules and Rationale](#f-advanced-eslint-rules-and-rationale)
7. [G. ESLint and Prettier Responsibilities](#g-eslint-and-prettier-responsibilities)
8. [H. Developer Commands](#h-developer-commands)
9. [I. GitHub Actions CI Quality Gate](#i-github-actions-ci-quality-gate)
10. [J. Failure Examples and Verification](#j-failure-examples-and-verification)
11. [K. Common Problems and Fixes](#k-common-problems-and-fixes)
12. [L. Code Quality Standards and Team Workflow](#l-code-quality-standards-and-team-workflow)

---

## A. Overview of the Code Quality System

### Why Code Quality Checks Are Essential

In a TypeScript monorepo containing multiple interconnected applications (`apps/frontend`, `apps/backend`) and shared packages (`packages/ui`, `packages/eslint-config`, `packages/typescript-config`):
- Small regressions, forgotten debug logs (`console.log`), and unsafe type escapes (`any`) quickly pollute the codebase.
- Circular or unused imports bloat production bundle sizes and hurt tree-shaking.
- Code style variations create noisy Git diffs and slow down peer reviews.
- Inconsistent imports between runtime modules and type declarations can cause build failures.

Automated quality gates eliminate these issues at the earliest possible stage: **on the developer's workstation before a commit or push is ever accepted.**

### Tool Roles and Responsibilities

- **ESLint 9**: A static code analysis tool that parses JavaScript and TypeScript Abstract Syntax Trees (ASTs) to detect code smells, anti-patterns, unused imports/variables, security vulnerabilities, and bad coding practices.
- **Prettier**: An opinionated code formatter that enforces deterministic whitespace, indentation, quotes, and line wrapping across TypeScript, TSX, and Markdown files.
- **Lefthook**: A high-performance, fast Git hooks manager written in Go. It intercepts Git lifecycle events (`pre-commit`, `pre-push`) and executes configured verification commands.
- **`lint-staged` Status in This Project**: **Not installed or configured.** Rather than depending on `lint-staged`, Lefthook natively manages Git hooks and invokes workspace linting directly.
- **Local Hooks vs. CI Checks**:
  - *Local Git Hooks (Lefthook)*: Fast, local safety net that runs on the developer's machine to catch errors before code leaves the laptop. Developers can bypass hooks with `--no-verify` if necessary.
  - *CI Quality Gate (GitHub Actions)*: The non-negotiable authoritative gate running on the self-hosted runner. It executes in a clean checkout, running linting, tests, and production builds to protect `main`.


---

## B. Project Structure

The files and packages governing linting and code quality are:

```text
full-stack-nextjs/
├── lefthook.yml                        # Lefthook Git hooks definition (pre-commit & pre-push)
├── package.json                        # Root package manifest (turbo scripts, prettier, lefthook)
├── pnpm-lock.yaml                      # Pinned workspace lockfile
├── pnpm-workspace.yaml                 # Monorepo packages and apps definition
├── turbo.json                          # Turborepo task pipeline definition for "lint" and "build"
├── apps/
│   ├── backend/
│   │   ├── eslint.config.mjs           # Backend ESLint entrypoint (Flat Config)
│   │   ├── package.json                # Backend scripts ("lint": "eslint .")
│   │   └── tsconfig.json               # Backend TypeScript configuration
│   └── frontend/
│       ├── eslint.config.mjs           # Frontend ESLint entrypoint (Flat Config)
│       ├── package.json                # Frontend scripts ("lint": "eslint .")
│       └── tsconfig.json               # Frontend TypeScript configuration
└── packages/
    ├── eslint-config/                  # Centralized shared ESLint package (@repo/eslint-config)
    │   ├── package.json                # Exports: "./base", "./next-js", "./react-internal"
    │   ├── base.js                     # Base Flat Config (tseslint, unused-imports, strict rules)
    │   ├── base.d.ts                   # TypeScript declaration for base config
    │   ├── next.js                     # Next.js & React hooks config (extends base)
    │   └── react-internal.js           # React library config for shared packages
    ├── typescript-config/              # Shared tsconfigs (base.json, nextjs.json, react-library.json)
    └── ui/
        ├── eslint.config.mjs           # UI package ESLint entrypoint (uses react-internal)
        └── package.json                # UI package scripts ("lint": "eslint . --max-warnings 0")
```

### Purpose of Key Configuration Files

- **`lefthook.yml`**: Defines the Git hook rules. Executes `pnpm lint` on `pre-commit` and both `pnpm lint` and `pnpm build` on `pre-push`.
- **`packages/eslint-config/base.js`**: The foundational ESLint 9 configuration shared across the monorepo. Configures TypeScript-ESLint, `eslint-plugin-unused-imports`, AST ignores, globals, and core strict rules.
- **`apps/backend/eslint.config.mjs`**: Imports and re-exports `baseConfig` from `@repo/eslint-config/base` for backend Node.js linting.
- **`apps/frontend/eslint.config.mjs`**: Imports and re-exports `baseConfig` from `@repo/eslint-config/base` for frontend Next.js linting.
- **`packages/ui/eslint.config.mjs`**: Imports and exports `config` from `@repo/eslint-config/react-internal`, adding React and React Hooks rules.
- **`turbo.json`**: Defines task relationships. Running `turbo run lint` automatically executes the `lint` script across all workspace packages concurrently with caching.

---

## C. Lefthook and Pre-Commit Hooks

### How Lefthook Works in This Monorepo

[Lefthook](https://github.com/evilmartians/lefthook) is managed as a development dependency in the root `package.json` (`"lefthook": "^2.1.10"`). When initialized, Lefthook installs small executable shell wrappers into `.git/hooks/` (`pre-commit`, `pre-push`, `prepare-commit-msg`).

### Actual Configuration (`lefthook.yml`)

The complete `lefthook.yml` file is configured as follows:

```yaml
pre-commit:
  commands:
    lint:
      run: pnpm lint

pre-push:
  commands:
    lint:
      run: pnpm lint
    build:
      run: pnpm build
```

### Execution Behavior

1. **Pre-Commit Hook**:
   - Triggers when you run `git commit`.
   - Executes `pnpm lint` (which runs `turbo run lint`).
   - Runs across all packages in scope (`backend`, `frontend`, `@repo/ui`).
   - If any package fails ESLint checks, the process exits with code 1, and **the Git commit is blocked**.
   - If no staged files are detected or all packages pass lint checks, the commit succeeds.
2. **Pre-Push Hook**:
   - Triggers when you run `git push`.
   - Executes both `pnpm lint` and `pnpm build`.
   - `pnpm build` compiles TypeScript in `backend` (`tsc`) and runs `next build` in `frontend`.
   - If any type error or Next.js build issue is detected, **the Git push is blocked**.

### Managing and Running Lefthook

```bash
# Verify Lefthook installation
npx lefthook version
# Output: 2.1.10

# Manually test the pre-commit hook without committing
npx lefthook run pre-commit

# Manually test the pre-push hook without pushing
npx lefthook run pre-push

# Force Lefthook to run against all files
npx lefthook run pre-commit --all-files

# Reinstall/re-link Git hooks into .git/hooks/
npx lefthook install
```

> [!NOTE]
> **Whole Project vs. Staged Files**:
> Because `lefthook.yml` uses `run: pnpm lint` without file arguments (such as `{staged_files}`), Turborepo lints packages where files have changed, using its internal cache for packages that remain untouched.

---

## D. Frontend ESLint Configuration

### Configuration File (`apps/frontend/eslint.config.mjs`)

The frontend application uses ESLint 9's new Flat Configuration format:

```javascript
import baseConfig from "@repo/eslint-config/base";

export default baseConfig;
```

### Framework Integration Details

- **ESLint Version**: `9.39.1`
- **Configuration Format**: Flat Config (`eslint.config.mjs`)
- **Parser & Language Support**: `typescript-eslint` v8 (`^8.50.0`)
- **Global Identifiers**: Inherits Node.js and Browser globals (`globals.node`, `globals.browser`)
- **Ignored Directories**:
  ```javascript
  ignores: [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
    "coverage/**",
  ]
  ```

### Frontend Lint Scripts

In `apps/frontend/package.json`:
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

To run linting specifically in the frontend workspace:
```bash
# From the repository root
pnpm --filter frontend lint

# Or inside the apps/frontend directory
cd apps/frontend && pnpm lint
```

To automatically fix auto-fixable issues:
```bash
cd apps/frontend && npx eslint . --fix
```

### Architectural Note: Next.js Plugin Preset

> [!NOTE]
> **Shared Preset Available**:
> The monorepo includes a dedicated Next.js ESLint configuration at `packages/eslint-config/next.js` containing `@next/eslint-plugin-next`, `eslint-plugin-react`, and `eslint-plugin-react-hooks`.
> Currently, `apps/frontend/eslint.config.mjs` directly imports `baseConfig`. If Next.js specific rules (`core-web-vitals`, Next Image/Link rules) are required in the future, `apps/frontend/eslint.config.mjs` can be switched to import `nextJsConfig` from `@repo/eslint-config/next-js`.

---

## E. Backend ESLint Configuration

### Configuration File (`apps/backend/eslint.config.mjs`)

The backend Express application also utilizes Flat Config:

```javascript
import baseConfig from "@repo/eslint-config/base";

export default baseConfig;
```

### Backend Characteristics

- **ESLint Version**: `9.39.1`
- **Module System**: ECMAScript Modules (`"type": "module"`)
- **TypeScript Integration**: Uses `typescript-eslint` without heavy type-checked project services, keeping linting fast for Express route controllers and database query layers.
- **Node Environment**: Configures `globals.node` so standard Node primitives (`process`, `Buffer`, `__dirname`, etc.) are recognized without undefined variable warnings.

### Backend Lint Scripts

In `apps/backend/package.json`:
```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

To run linting in the backend workspace:
```bash
# From the repository root
pnpm --filter backend lint

# Or inside the apps/backend directory
cd apps/backend && pnpm lint
```

---

## F. Advanced ESLint Rules and Rationale

The shared configuration in `packages/eslint-config/base.js` activates a strict set of rules that enforce clean TypeScript design, clean imports, and runtime reliability.

### Summary Table of Active Rules

| Rule or Plugin | Applied To | What It Checks | Why It Matters | Severity |
|---|---|---|---|---|
| `unused-imports/no-unused-imports` | Frontend, Backend, UI | Unused `import` statements across files | Eliminates dead imports, reducing bundle size and preventing circular dependencies | **Error** |
| `unused-imports/no-unused-vars` | Frontend, Backend, UI | Unused variables, parameters, and catch errors | Catches abandoned code; allows intentional unused variables only if prefixed with `_` | **Error** |
| `@typescript-eslint/no-explicit-any` | Frontend, Backend, UI | Use of `any` type escape hatch | Enforces strong typing; prevents developers from bypassing TypeScript type safety | **Error** |
| `@typescript-eslint/no-non-null-assertion` | Frontend, Backend, UI | Non-null assertions (`object!.property`) | Warns against runtime `TypeError: Cannot read properties of undefined` | **Warn** |
| `@typescript-eslint/consistent-type-imports` | Frontend, Backend, UI | Enforces `import type` for type-only imports | Improves tree-shaking, prevents runtime circular deps, and clarifies intent | **Error** |
| `no-console` | Frontend, Backend, UI | Usage of `console.log`, `console.info`, etc. | Prevents sensitive data leaking into production stdout; allows `console.warn` and `console.error` | **Error** |
| `eqeqeq` | Frontend, Backend, UI | Strict equality (`===` and `!==`) | Prevents dangerous JavaScript coercion bugs (e.g. `0 == ""` is true) | **Error** |
| `no-duplicate-imports` | Frontend, Backend, UI | Multiple import statements from the same module | Keeps imports consolidated at the top of files | **Error** |
| `curly` | Frontend, Backend, UI | Braces around control flow blocks (`if`, `for`) | Prevents subtle bugs where statements look scoped but are not | **Error** |
| `no-param-reassign` | Frontend, Backend, UI | Mutation of function arguments | Prevents unexpected side effects and maintains pure, predictable functions | **Error** |
| `prefer-const` | Frontend, Backend, UI | `let` variables that are never reassigned | Communicates immutability to developers and compilers | **Error** |
| `prefer-template` | Frontend, Backend, UI | String concatenation (`a + ' ' + b`) | Enforces readable template literals (`` `${a} ${b}` ``) | **Error** |
| `object-shorthand` | Frontend, Backend, UI | Object properties matching variable names | Enforces modern ES6 `{ name }` syntax over `{ name: name }` | **Error** |
| `no-unneeded-ternary` | Frontend, Backend, UI | Redundant ternary operators | Simplifies `x ? true : false` into `Boolean(x)` | **Error** |

---

### Detailed Breakdown and Code Examples

#### 1. `unused-imports/no-unused-imports`
- **What it catches**: Leftover `import` statements for components, functions, or libraries that are no longer used.
- **Why it matters**: Dead imports inflate Next.js client bundles, slow down builds, and can trigger unwanted side-effect initializations.
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: fs is imported but never called
  import fs from "fs";
  import { pool } from "./database/db";

  export const getHealth = () => pool.query("SELECT 1");
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Unused import removed
  import { pool } from "./database/db";

  export const getHealth = () => pool.query("SELECT 1");
  ```

---

#### 2. `unused-imports/no-unused-vars`
- **What it catches**: Variables or function parameters declared but never referenced.
- **Configured Options**:
  ```javascript
  {
    vars: "all",
    args: "after-used",
    ignoreRestSiblings: true,
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_"
  }
  ```
- **Why it matters**: Unused variables often indicate incomplete features or logic errors. Allowing `^_` gives developers a clean way to acknowledge unused framework parameters (e.g., Express `_req`).
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: req is defined but unused
  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Prefix unused parameter with underscore
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  ```

---

#### 3. `@typescript-eslint/no-explicit-any`
- **What it catches**: Using `any` as a type annotation.
- **Why it matters**: `any` disables all type-checking for that variable and anything it touches, eliminating the safety benefits of TypeScript.
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: Using any bypasses type safety
  function parseData(input: any) {
    return input.data.value;
  }
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Use unknown with type narrowing or define an interface
  interface Payload {
    data: { value: string };
  }

  function parseData(input: unknown): string {
    if (typeof input === "object" && input !== null && "data" in input) {
      return (input as Payload).data.value;
    }
    throw new Error("Invalid payload");
  }
  ```

---

#### 4. `@typescript-eslint/consistent-type-imports`
- **What it catches**: Importing types using runtime `import { SomeType } from "module"`.
- **Configured Options**:
  ```javascript
  {
    prefer: "type-imports",
    fixStyle: "inline-type-imports"
  }
  ```
- **Why it matters**: Emitting `import type` ensures bundlers (Turbopack, esbuild, SWC) can safely strip type-only declarations without generating unnecessary runtime `require` or `import` calls.
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: Request is only used as a type annotation
  import { Request, Response } from "express";

  export type CustomHandler = (req: Request, res: Response) => void;
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Use inline or top-level type import
  import type { Request, Response } from "express";

  export type CustomHandler = (req: Request, res: Response) => void;
  ```

---

#### 5. `no-console`
- **What it catches**: `console.log()`, `console.info()`, `console.debug()`.
- **Configured Options**: `["error", { allow: ["warn", "error"] }]`.
- **Why it matters**: Prevents accidental leakage of user tokens, database passwords, or PII into container logs in production, while permitting necessary system warnings and errors.
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: console.log is disallowed
  console.log("Database connection established:", dbHost);
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Use console.warn/error or an application logger
  console.error("Database connection established:", dbHost);
  ```

---

#### 6. `no-param-reassign`
- **What it catches**: Mutating function arguments directly (`x.prop = y` or `x = y`).
- **Why it matters**: Mutating parameters can cause unpredictable side effects in calling scopes and makes functions impure and difficult to test.
- **Example Violation**:
  ```typescript
  // ❌ VIOLATION: Reassigning parameter
  function sanitizeTask(task: { name: string }) {
    task.name = task.name.trim();
    return task;
  }
  ```
- **Correction**:
  ```typescript
  // ✅ FIXED: Return a new object with spread syntax
  function sanitizeTask(task: { name: string }) {
    return {
      ...task,
      name: task.name.trim(),
    };
  }
  ```

---


## G. ESLint and Prettier Responsibilities

### Division of Concerns

| Area | ESLint | Prettier |
|---|---|---|
| **Core Responsibility** | Code Quality & Bug Prevention | Code Formatting & Visual Style |
| **What It Checks** | Unused variables, unsafe types, variable scoping, syntax anti-patterns | Line wrapping, quote styles (single vs double), indentation (spaces vs tabs), trailing commas |
| **Can Break Code?** | Yes, if logic errors are unhandled | No, only alters formatting without changing AST semantics |
| **Execution Trigger** | Automated via Lefthook `pre-commit`, `pre-push`, and GitHub Actions | Manual via `pnpm run format` |

### ESLint & Prettier Integration (`eslint-config-prettier`)

When ESLint and Prettier are used together, stylistic ESLint rules (like `indent` or `semi`) can conflict with Prettier's layout engine.
- To resolve this, `eslint-config-prettier` is installed in `packages/eslint-config/package.json`.
- It is integrated into `packages/eslint-config/next.js` and `packages/eslint-config/react-internal.js` to automatically disable conflicting stylistic rules.

### Formatting Commands

Prettier is configured at the root of the repository:
```bash
# Check formatting across all files without modifying them
npx prettier --check "**/*.{ts,tsx,md}"

# Automatically format and overwrite files
pnpm run format
# (Executes: prettier --write "**/*.{ts,tsx,md}")
```

---

## H. Developer Commands

All linting and quality commands run using `pnpm` from the root of the repository:

### Command Reference Table

| Target | Command | Action Performed | Modifies Files? |
|---|---|---|:---:|
| **Full Repository Lint** | `pnpm lint` | Runs `turbo run lint` across all apps and packages | ❌ No |
| **Frontend Lint** | `pnpm --filter frontend lint` | Runs `eslint .` inside `apps/frontend` | ❌ No |
| **Backend Lint** | `pnpm --filter backend lint` | Runs `eslint .` inside `apps/backend` | ❌ No |
| **UI Package Lint** | `pnpm --filter @repo/ui lint` | Runs `eslint . --max-warnings 0` inside `packages/ui` | ❌ No |
| **ESLint Auto-Fix (Frontend)** | `pnpm --filter frontend exec eslint . --fix` | Automatically fixes fixable ESLint errors in frontend | ✍️ Yes |
| **ESLint Auto-Fix (Backend)** | `pnpm --filter backend exec eslint . --fix` | Automatically fixes fixable ESLint errors in backend | ✍️ Yes |
| **Prettier Format** | `pnpm run format` | Overwrites files with Prettier formatting | ✍️ Yes |
| **Prettier Check** | `npx prettier --check "**/*.{ts,tsx,md}"` | Verifies formatting without changing files | ❌ No |
| **Type Check** | `pnpm run check-types` | Runs TypeScript compiler check (`tsc --noEmit`) | ❌ No |
| **Lefthook Manual Test** | `npx lefthook run pre-commit` | Simulates the Git pre-commit hook locally | ❌ No |

### Recommended Pre-PR Verification Sequence

Before submitting a Pull Request, run this three-step sequence to guarantee CI success:

```bash
# 1. Format code with Prettier
pnpm run format

# 2. Run static analysis across all workspaces
pnpm lint

# 3. Verify TypeScript builds and standalone Next.js compilation
pnpm build
```

---

## I. GitHub Actions CI Quality Gate

The CI quality gate is defined in [`.github/workflows/production.yaml`](file:///home/er/Desktop/full-stack-nextjs/.github/workflows/production.yaml).

### Workflow Trigger Rules

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, closed]
```

- Every pull request targeting `main` automatically triggers the `ci-pipeline` job on the self-hosted runner.
- The pipeline executes in strict chronological order:
  1. `actions/checkout@v4`: Checks out the PR branch.
  2. `actions/setup-node@v4`: Configures Node.js 22.
  3. `pnpm/action-setup@v4`: Activates pnpm.
  4. `pnpm install --frozen-lockfile`: Installs dependencies deterministically from `pnpm-lock.yaml`.
  5. `pnpm lint`: Runs ESLint via Turborepo across all packages.
  6. `pnpm test`: Runs Jest unit tests.
  7. `pnpm build`: Runs production builds.

### Quality Gate Enforcement

- **Failure Propagation**: If `pnpm lint` detects any unignored error in any workspace, Turborepo exits with code 1. GitHub Actions immediately marks `ci-pipeline` as failed and skips subsequent deployment steps.
- **Slack Alert Trigger**: When `ci-pipeline` fails, the `notify-slack` job triggers automatically and alerts the engineering team with a direct link to the failing workflow run.
- **Branch Protection**: When GitHub Branch Protection is enabled for `main` with `ci-pipeline` set as a **Required Status Check**, developers cannot merge code until all lint and build checks pass.

---

## J. Failure Examples and Verification

Use these step-by-step test procedures to verify that quality gates are working correctly.

### Test 1: Verify Pre-Commit Hook Blocks Unsafe `any`

1. Open `apps/backend/src/server.ts` and add an invalid type declaration:
   ```typescript
   const debugData: any = "unsafe";
   ```
2. Stage the file:
   ```bash
   git add apps/backend/src/server.ts
   ```
3. Attempt to commit:
   ```bash
   git commit -m "test: verify pre-commit error"
   ```
4. **Expected Result**: Lefthook triggers `pnpm lint`. ESLint reports:
   ```text
   error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   ```
   The commit is aborted and `apps/backend/src/server.ts` remains staged.
5. Revert the file:
   ```bash
   git checkout -- apps/backend/src/server.ts
   ```

---

### Test 2: Verify Pre-Commit Hook Catches `console.log`

1. Open `apps/frontend/src/app/page.tsx` and add a debug log:
   ```typescript
   console.log("Loading home page...");
   ```
2. Stage the file:
   ```bash
   git add apps/frontend/src/app/page.tsx
   ```
3. Attempt to commit:
   ```bash
   git commit -m "test: verify console.log check"
   ```
4. **Expected Result**: Lefthook aborts the commit with:
   ```text
   error  Unexpected console statement. Only these console methods are allowed: warn, error  no-console
   ```
5. Replace with `console.warn(...)` or remove the line, then commit cleanly.

---

### Verification Audit Record

| Test Scenario | Target File | Rule Verified | Expected Result | Actual Result | Verification Status |
|---|---|---|---|---|:---:|
| **Unused Import** | `apps/backend/src/server.ts` | `unused-imports/no-unused-imports` | Error: `'fs' is defined but never used` | Caught by ESLint AST check | **Verified** |
| **Explicit Any** | `apps/backend/src/server.ts` | `@typescript-eslint/no-explicit-any` | Error: `Unexpected any. Specify a different type` | Caught by ESLint AST check | **Verified** |
| **Disallowed Console** | `apps/frontend/src/app/page.tsx` | `no-console` | Error: `Unexpected console statement` | Caught by ESLint AST check | **Verified** |
| **Loose Equality** | `apps/backend/src/server.ts` | `eqeqeq` | Error: `Expected '===' and instead saw '=='` | Caught by ESLint AST check | **Verified** |
| **Missing Braces** | `apps/backend/src/server.ts` | `curly` | Error: `Expected { after 'if' condition` | Caught by ESLint AST check | **Verified** |
| **Type-Only Import** | `apps/backend/src/server.ts` | `@typescript-eslint/consistent-type-imports` | Error: `All imports are only used as types. Use import type` | Caught by ESLint AST check | **Verified** |

---

## K. Common Problems and Fixes

### 1. Error: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file`
- **Cause**: Running `npx eslint .` from the root of the repository. In this monorepo, ESLint 9 Flat Configs reside inside each app and package (`apps/backend/eslint.config.mjs`, `apps/frontend/eslint.config.mjs`), not in the root directory.
- **Diagnostic Command**:
  ```bash
  ls eslint.config.*
  ```
- **Fix**: Run linting via Turborepo or target the specific workspace:
  ```bash
  # Correct: Use Turborepo from root
  pnpm lint

  # Or target specific workspace
  pnpm --filter backend lint
  ```

---

### 2. Lefthook Hooks Not Firing on Commit
- **Cause**: Lefthook executable hooks are missing from `.git/hooks/` (common after a fresh clone or when Git hooks were cleared).
- **Diagnostic Command**:
  ```bash
  ls -la .git/hooks/pre-commit
  ```
- **Fix**: Reinstall Lefthook hooks into the Git repository:
  ```bash
  npx lefthook install
  ```

---

### 3. ESLint Fails with `All imports in the declaration are only used as types`
- **Cause**: You imported an interface, type, or type alias using `import { SomeInterface }` instead of `import type { SomeInterface }`.
- **Diagnostic Output**: `@typescript-eslint/consistent-type-imports`
- **Fix**: Update the import to use type-only syntax:
  ```typescript
  import type { Task } from "@/types/task";
  ```

---

### 4. Hook Passes Locally but Fails in CI
- **Cause**: Dependencies on the local machine differ from `pnpm-lock.yaml`, or uncommitted files exist locally that were not pushed to GitHub.
- **Diagnostic Command**:
  ```bash
  git status
  pnpm install --frozen-lockfile
  ```
- **Fix**: Ensure your branch working tree is completely clean and dependencies match the lockfile exactly before pushing.

---

### 5. Prettier Style Differences Create Merge Conflicts
- **Cause**: Developers have different editor formatters configured (e.g. VS Code Beautify vs Prettier) and commit unformatted files.
- **Fix**: Format all files before staging:
  ```bash
  pnpm run format
  ```
  Ensure VS Code is configured with `editor.defaultFormatter: "esbenp.prettier-vscode"` and `editor.formatOnSave: true`.

---

## L. Code Quality Standards and Team Workflow

### Developer Day-to-Day Checklist

1. **Write Clean Code**: Follow TypeScript best practices. Avoid `any` types; prefer strict interfaces and type unions.
2. **Handle Errors Explicitly**: Do not catch errors with empty blocks. Prefix intentional unused error variables with `_` (e.g., `catch (_err) {}`).
3. **Format Before Committing**: Run `pnpm run format` or configure your IDE to format on save.
4. **Respect Hook Gates**: Never commit with `git commit --no-verify` unless troubleshooting an emergency. If Lefthook blocks a commit, read the error message and fix the root issue.
5. **Keep Diffs Clean**: Avoid unnecessary reformatting of files unrelated to your pull request.

### When Is an ESLint Disable Justified?

- **Acceptable**: Third-party JavaScript libraries lacking TypeScript definitions where `any` is temporarily unavoidable:
  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Legacy untyped library payload
  const rawPayload: any = legacyLibrary.getData();
  ```
- **Unacceptable**: Disabling rules globally or disabling rules to avoid writing proper interfaces or refactoring complex logic. Every `eslint-disable` must include a comment explaining the rationale.
