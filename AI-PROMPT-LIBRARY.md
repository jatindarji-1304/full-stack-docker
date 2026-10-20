# AI Prompt Library

> Reusable prompts for daily development on the **full-stack-nextjs** monorepo.
> Copy a prompt, replace every `[PLACEHOLDER]` with the real value, and paste it into Claude Code, GitHub Copilot Chat, or Antigravity.

---

## Repository Quick Reference

| Layer | Location | Language / Framework |
|---|---|---|
| Frontend | `apps/frontend/` | Next.js 15, React, TypeScript, TanStack Form, TanStack Table, Zod, Axios, Tailwind CSS |
| Backend | `apps/backend/` | Express, TypeScript, `pg` (PostgreSQL pool), `express-rate-limit` |
| Shared types | `apps/frontend/src/types/task.ts` | Zod schema → TypeScript inference |
| Server Actions | `apps/frontend/src/action/` | `"use server"` async functions returning `{ ok, value } \| { ok, error }` |
| API client | `apps/frontend/src/api/client.ts` | Axios instance pointing at `NEXT_PUBLIC_BASE_URI` |
| Result type | `apps/frontend/src/lib/result.ts` | Rust-style `Result<T, E>` helpers (`Ok`, `Err`, etc.) |
| DB schema | `apps/backend/src/database/schema.sql` | Single `task` table: `id UUID`, `name TEXT`, `created_at TIMESTAMPTZ` |
| Tests | `apps/frontend/tests/`, `apps/backend/test/` | Jest + React Testing Library (frontend); Jest + Supertest (backend) |
| Lint | `lefthook.yml` | `pnpm lint` on pre-commit and pre-push; `pnpm build` on pre-push |
| CI/CD | `.github/workflows/production.yaml` | Self-hosted runner → lint → test → build → Docker preview per PR → Slack on failure |
| Containers | `docker-compose.yml` | `demo-frontend` (port 3000), `demo-backend` (port 3001), Traefik as reverse proxy |

---

## Prompts

---

### 1. Implement a Feature

**When to use:** You are starting work on a new capability (new route, new UI component, new Server Action, etc.).

---

```
You are working inside the full-stack-nextjs monorepo.

## Repository context (read before writing any code)
- Frontend: apps/frontend/ — Next.js 15, React, TypeScript, TanStack Form, TanStack Table, Zod, Axios, Tailwind CSS.
- Backend: apps/backend/ — Express, TypeScript, node-postgres (pg pool).
- Server Actions live in apps/frontend/src/action/ and are marked "use server". They return a plain discriminated union: { ok: true; value: T } | { ok: false; error: string }.
- The Zod schema for a task is in apps/frontend/src/types/task.ts. Mirror the same field names in the backend.
- Backend controllers live in apps/backend/src/controller/, routes in apps/backend/src/routes/. Every route is guarded by a rate-limit middleware from apps/backend/src/middleware/rate_limit.middleware.ts.
- The database pool is in apps/backend/src/database/db.ts. Use parameterised queries ($1, $2, …). Never interpolate user input into SQL.
- The frontend API client is apps/frontend/src/api/client.ts (Axios, base URL from NEXT_PUBLIC_BASE_URI).
- Use existing UI components from apps/frontend/src/components/ui/ before creating new ones.
- Follow the existing naming conventions: snake_case for Server Actions and files, PascalCase for React components, camelCase for variables.

## Task
Implement **[FEATURE_NAME]**.

[SHORT_DESCRIPTION_OF_WHAT_IT_SHOULD_DO]

## Instructions
1. Inspect the existing code relevant to this feature before writing anything.
2. List the files you plan to create or modify and explain why.
3. Implement the backend first (schema change if needed, controller function, route registration, rate-limit guard), then the frontend (Zod type, Server Action, component or page).
4. Make only changes required for this feature. Do not refactor unrelated code.
5. After implementing, confirm whether existing tests still pass, and identify which new tests should be written.
6. State any assumptions or missing information explicitly.
```

**Expected output:** A list of changed files with code, an explanation of each decision, and a list of suggested tests.

**Verification checklist**
- [ ] Backend SQL uses parameterised queries (no string interpolation)
- [ ] New route is registered in `apps/backend/src/routes/task.routes.ts` (or equivalent) and has a rate-limit guard
- [ ] Server Action returns `{ ok: true; value }` or `{ ok: false; error: string }`
- [ ] Zod schema validates the response before the Server Action returns
- [ ] New UI uses existing components from `apps/frontend/src/components/ui/`
- [ ] `pnpm lint && pnpm test && pnpm build` passes

---

### 2. Debug an Issue

**When to use:** Something is broken — wrong response, crash, render error, or unexpected behavior.

---

```
You are debugging an issue in the full-stack-nextjs monorepo.

## Error / symptom
[PASTE_ERROR_MESSAGE_OR_DESCRIBE_UNEXPECTED_BEHAVIOR]

## Where it occurs
- Layer: [frontend | backend | CI | Docker]
- File / route / component (if known): [FILE_OR_ROUTE]

## Repository context
- Backend controllers: apps/backend/src/controller/task.controller.ts
- Routes: apps/backend/src/routes/task.routes.ts
- Rate-limit middleware: apps/backend/src/middleware/rate_limit.middleware.ts
- DB pool: apps/backend/src/database/db.ts (pg Pool, env vars: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DB_HOST, DB_PORT)
- Server Actions: apps/frontend/src/action/ (return { ok, value } | { ok, error })
- Frontend API client: apps/frontend/src/api/client.ts (Axios, NEXT_PUBLIC_BASE_URI)
- TaskTable and TaskForm components: apps/frontend/src/components/

## Instructions
1. Read the relevant source files before suggesting anything.
2. Trace the request or render path from entry point to failure.
3. Identify the most likely root cause. Distinguish confirmed problems from hypotheses.
4. Propose the smallest safe fix. Do not touch unrelated code.
5. Explain why the fix resolves the root cause.
6. State what test or manual step would confirm the fix works.
```

**Expected output:** Root cause analysis, the exact change to make, and a verification step.

**Verification checklist**
- [ ] Root cause is traced to a specific file and line
- [ ] Fix does not change unrelated behavior
- [ ] A test or `curl` command confirms the fix before merging
- [ ] `pnpm lint && pnpm test` passes after the fix

---

### 3. Review a Pull Request

**When to use:** Before merging a PR; you want a structured review that catches bugs, regressions, and missing tests.

---

```
You are reviewing a pull request for the full-stack-nextjs monorepo.

## PR diff
[PASTE_FULL_GIT_DIFF_OR_CHANGED_FILE_LIST]

## PR description
[PASTE_PR_TITLE_AND_DESCRIPTION]

## Repository context
- Backend validation: UUID regex check on all ID params; `name` must be a non-empty string.
- Backend SQL: always parameterised. Rate-limit middleware on every route.
- Frontend Server Actions: return discriminated union, parse response with Zod `.safeParse()`.
- CI runs: pnpm lint → pnpm test → pnpm build (see .github/workflows/production.yaml).
- Lefthook blocks commits and pushes that fail lint or build.

## Review instructions
1. Read the diff carefully. Read the referenced source files for full context if needed.
2. Report findings grouped by severity: **Critical** (bugs, security, data loss) → **High** (logic errors, missing validation) → **Medium** (missing tests, weak assertions) → **Low** (style, naming).
3. For each finding: state the file and line, what the problem is, why it matters, and what the fix should be.
4. Do not report speculative issues as facts — label uncertain findings as "potential concern".
5. Confirm whether the PR adds or updates tests to cover the changed code.
6. Check that CI steps (lint, test, build) will still pass based on the diff.
```

**Expected output:** Severity-grouped findings, each with file/line, problem description, and suggested fix.

**Verification checklist**
- [ ] All Critical findings are addressed before merge
- [ ] New route/handler has a corresponding test
- [ ] No raw SQL string interpolation introduced
- [ ] No secrets or credentials added to source files
- [ ] `pnpm lint && pnpm test && pnpm build` passes

---

### 4. Generate Unit Tests — Backend Route

**When to use:** You have written a new Express controller or route and need Supertest tests following the existing pattern.

---

```
You are writing backend unit tests for the full-stack-nextjs monorepo.

## Target
Write Jest + Supertest tests for **[CONTROLLER_FUNCTION_OR_ROUTE]** in [FILE_PATH].

## Existing test pattern to follow
- Test file: apps/backend/test/routes/task.route.test.ts
- The pg pool is mocked at the top of the file:
  jest.mock("../../src/database/db", () => ({ __esModule: true, pool: { query: jest.fn() } }))
- Each describe block covers one HTTP method + path.
- Use (mocked_pool.query as jest.Mock).mockResolvedValueOnce({ rows: [...] }) to control DB responses.
- Call (mocked_pool.query as jest.Mock).mockReset() in beforeEach.
- Assert exact HTTP status codes and exact JSON response bodies.

## Instructions
1. Read the controller source file before writing tests.
2. Cover these cases for each endpoint:
   - Happy path (valid input, expected success response)
   - Invalid or missing required fields → 400
   - Invalid UUID format → 400
   - Resource not found → 404
   - Database error (mockRejectedValueOnce(new Error("db error"))) → 500
3. Use descriptive test names that state the condition and expected outcome.
4. Do not add tests for behavior that does not exist in the current code.
5. Place the test file at apps/backend/test/[MATCHING_PATH]/[FILE_NAME].test.ts.
```

**Expected output:** A complete test file that can be dropped into `apps/backend/test/` and passes with `pnpm test`.

**Verification checklist**
- [ ] Mock is set up at the top of the file using `jest.mock`
- [ ] `mockReset()` is called in `beforeEach`
- [ ] 500 error path is tested with `mockRejectedValueOnce`
- [ ] Assertions use exact expected values, not partial matches on the happy path
- [ ] `cd apps/backend && pnpm test` passes

---

### 5. Generate Unit Tests — Frontend Component or Page

**When to use:** You have written a new React component, Server Component page, or Server Action and need RTL tests following the existing pattern.

---

```
You are writing frontend unit tests for the full-stack-nextjs monorepo.

## Target
Write Jest + React Testing Library tests for **[COMPONENT_OR_PAGE_NAME]** at [FILE_PATH].

## Existing test patterns to follow
- Component tests: apps/frontend/tests/components/task/task_form.test.tsx
  Uses userEvent.setup(), queries by role/label, mocks onSubmit and onPropsChange.
- Page tests: apps/frontend/tests/pages/home.test.tsx
  Mocks Server Actions with jest.mock("@/action/..."), awaits the async page function, then renders the result.
- Server Actions return { ok: true; value } | { ok: false; error: string }.
- Use jest.fn() for callback props; assert with toHaveBeenCalledWith().
- Prefer getByRole and getByLabelText over getByTestId where possible.

## Instructions
1. Read the component or page source file before writing tests.
2. Cover:
   - Renders correctly with valid props / successful data fetch
   - Renders empty state or fallback when data is missing or the action returns { ok: false }
   - User interactions (typing, clicking, form submission) trigger the correct callbacks
   - Validation errors appear when expected
   - Loading or skeleton state if applicable
3. Do not test implementation details (internal state, private functions).
4. Place the test file at apps/frontend/tests/[MATCHING_PATH]/[FILE_NAME].test.tsx.
```

**Expected output:** A complete test file that passes with `cd apps/frontend && pnpm test`.

**Verification checklist**
- [ ] Server Actions mocked with `jest.mock("@/action/...")`
- [ ] Both success and `{ ok: false }` paths are tested
- [ ] User interactions use `userEvent` (not `fireEvent`)
- [ ] No assertions on implementation details (state, private refs)
- [ ] `cd apps/frontend && pnpm test` passes

---

### 6. Review and Improve Existing Tests

**When to use:** Tests are passing but you suspect they are too shallow, brittle, or miss important cases.

---

```
You are reviewing the test quality in the full-stack-nextjs monorepo.

## Target test file(s)
[FILE_PATH_OR_LIST_OF_FILES]

## Instructions
1. Read the test file(s) and the source file(s) they test.
2. Identify and report findings in these categories:
   a. **Missing scenarios** — behavior in the source that is not tested at all.
   b. **Weak assertions** — tests that pass even when the code is broken (e.g., only checking status code but not response body).
   c. **Brittle tests** — tests that break due to irrelevant implementation details.
   d. **Incorrect or misleading mocks** — mocks that do not reflect real behavior (e.g., always returning the same rows for a GET-by-ID test without checking which rows).
   e. **Duplicate or redundant tests** — tests that repeat assertions already covered by another test.
3. For each finding: state the test name, what is wrong, and propose a specific improvement.
4. Prioritise missing 500/database-error paths and missing validation-error paths.
5. Do not suggest rewriting tests that already verify meaningful behavior correctly.
```

**Expected output:** A prioritised list of improvements with specific, actionable suggestions for each test.

**Verification checklist**
- [ ] 500 / database-error path exists for every controller function
- [ ] UUID validation 400 path is tested for every endpoint that accepts an ID param
- [ ] Assertions check both status code and exact response body on error paths
- [ ] `pnpm test` still passes after suggested changes are applied

---

### 7. Create or Review a Backend API Endpoint

**When to use:** Adding a new Express route and controller, or reviewing one that already exists for correctness and safety.

---

```
You are creating or reviewing an Express API endpoint in the full-stack-nextjs backend.

## Task
[CREATE | REVIEW] the **[HTTP_METHOD] /[ROUTE_PATH]** endpoint.

[FOR CREATE: describe what it should do]
[FOR REVIEW: paste the controller and route code below]

## Existing backend conventions to follow (read these files first)
- Route file: apps/backend/src/routes/task.routes.ts
- Controller file: apps/backend/src/controller/task.controller.ts
- Rate-limit middleware: apps/backend/src/middleware/rate_limit.middleware.ts
- DB pool: apps/backend/src/database/db.ts

## Conventions
- UUID params are validated with the UUID_REGEX before any DB call.
- Body fields are validated for type and presence before any DB call.
- All SQL uses parameterised placeholders ($1, $2, …). No string concatenation.
- Return 400 for invalid input, 404 for not found, 500 for unexpected errors.
- Each method has its own rate-limit instance from rate_limit.middleware.ts.
- 500 handler logs the error with console.error(err) and returns { error: "..." }.
- Successful creates return 201; reads and updates return 200.

## Instructions
1. Read the existing controller and route files before writing or reviewing.
2. [FOR CREATE] Implement the controller function and register the route following the patterns above.
3. [FOR REVIEW] List every deviation from the conventions above. Confirm or deny: UUID validation present? Body validation present? Parameterised SQL? Rate limit applied? Error paths handled?
4. List tests that should be written for this endpoint.
5. Do not modify unrelated routes or middleware.
```

**Expected output:** Complete controller + route code (for create), or an annotated checklist of issues (for review), plus a list of required tests.

**Verification checklist**
- [ ] UUID param validated before DB call
- [ ] Body fields validated for type and presence before DB call
- [ ] All SQL uses `$1`, `$2`, … placeholders
- [ ] Rate-limit middleware applied on the route
- [ ] 400, 404, and 500 paths all handled
- [ ] `pnpm lint && pnpm test` passes

---

### 8. Add a New Server Action (Frontend)

**When to use:** You need a new `"use server"` function in `apps/frontend/src/action/` that calls the backend and returns a typed result.

---

```
You are adding a new Server Action to the full-stack-nextjs frontend.

## Task
Create a Server Action named **[ACTION_NAME]** that [DESCRIBE_WHAT_IT_DOES].

## Existing Server Action conventions (read these files first)
- apps/frontend/src/action/get_task.ts
- apps/frontend/src/action/add_task.ts
- apps/frontend/src/api/client.ts (Axios instance, base URL from NEXT_PUBLIC_BASE_URI)
- apps/frontend/src/types/task.ts (Zod schema)

## Conventions
- File starts with "use server".
- Import taskApi from "@/api/client" and relevant Zod schemas from "@/types/".
- Return type is always { ok: true; value: T } | { ok: false; error: string }.
- Parse the Axios response with Zod .safeParse() or z.array(...).safeParse() before returning.
- Catch axios.isAxiosError(error) and map status codes to { ok: false; error } messages.
- Fall back to { ok: false; error: "Server Error" } for any other exception.
- Do not throw from a Server Action; always return the discriminated union.

## Instructions
1. Read the existing action files for exact patterns before writing.
2. Implement the action following the conventions above.
3. State what Zod schema you are using and why.
4. List any environment variables the action depends on.
5. Suggest the test cases that should cover this action.
```

**Expected output:** Complete `"use server"` file at `apps/frontend/src/action/[action_name].ts` and a list of test cases.

**Verification checklist**
- [ ] File begins with `"use server"`
- [ ] Response parsed with Zod `.safeParse()` before returning
- [ ] Both `{ ok: true }` and `{ ok: false }` paths exist
- [ ] No uncaught exceptions — all caught and mapped to `{ ok: false; error }`
- [ ] `pnpm lint` passes

---

### 9. Improve Code Quality

**When to use:** Code works, but you want to reduce duplication, eliminate unsafe assumptions, or improve maintainability.

---

```
You are improving code quality in the full-stack-nextjs monorepo without changing external behavior.

## Target file(s)
[FILE_PATH_OR_LIST]

## Instructions
1. Read the target file(s) fully before making any suggestions.
2. Identify and report issues in these categories:
   - **Unsafe assumptions** — code that will crash or behave incorrectly for untested inputs (e.g., unchecked .data access after safeParse without checking .success).
   - **Duplication** — repeated logic that could be extracted into a small shared helper without introducing unnecessary indirection.
   - **Unnecessary complexity** — multi-step logic that can be simplified without losing clarity.
   - **Maintainability problems** — magic values, missing type annotations, implicit any, or code that will be confusing to the next developer.
3. For each issue: state the line(s), what the problem is, and propose a concrete, minimal fix.
4. Do not introduce new abstractions or patterns that are not already used in this codebase.
5. Do not refactor code that is not related to the identified issues.
6. After suggesting changes, confirm that pnpm lint and pnpm test would still pass.
```

**Expected output:** A prioritised list of specific improvements with exact code suggestions.

**Verification checklist**
- [ ] No new abstractions that aren't already present in the codebase
- [ ] External behavior is preserved
- [ ] `pnpm lint && pnpm test` passes
- [ ] Changes are limited to files identified in the task

---

### 10. Generate or Update Documentation

**When to use:** A feature or workflow has changed and the docs need to catch up, or a new `.md` file is needed.

---

```
You are writing or updating documentation for the full-stack-nextjs monorepo.

## Target document
[FILE_NAME].md — [ONE_LINE_PURPOSE]

## Instructions
1. Read the relevant source files, configuration files, and existing documentation before writing.
2. Document only what is actually implemented. Do not describe planned or hypothetical features.
3. For setup documentation: verify each command by checking the actual package.json scripts and Dockerfiles.
4. For API documentation: read the actual controllers to determine correct routes, request shapes, and response shapes.
5. For CI/CD documentation: read .github/workflows/production.yaml for the exact workflow.
6. Use fenced code blocks for all commands and code samples.
7. If something is partially implemented or missing, note it clearly with a "Not yet implemented" callout.
8. Do not invent environment variable names, port numbers, or script names — only document those present in the repository.

## Key facts to verify (check actual files, do not assume)
- Package scripts: package.json at root and in apps/frontend/ and apps/backend/
- Docker services: docker-compose.yml — services demo-frontend (3000), demo-backend (3001)
- CI steps: .github/workflows/production.yaml — lint → test → build → Docker preview → Slack notification
- Lefthook hooks: lefthook.yml — pre-commit: lint; pre-push: lint + build
- Database schema: apps/backend/src/database/schema.sql
```

**Expected output:** A complete, accurate Markdown file with no invented details.

**Verification checklist**
- [ ] Every command in the doc exists in an actual `package.json` script or `Dockerfile`
- [ ] Every environment variable name matches what is in `docker-compose.yml` or source files
- [ ] No steps described as "coming soon" or "planned" unless sourced from existing comments in the repo
- [ ] Prettier formatting: `pnpm format` passes on the new file

---



