# Testing Documentation

## Overview
This repository contains a **full‑stack Next.js** application split into two separate packages:
- **`apps/frontend`** – a React/Next.js client.
- **`apps/backend`** – an Express API written in TypeScript.

Both layers have a unit‑style testing setup that runs automatically in CI. The documentation below describes the current testing frameworks, the existing test suites, how to run them locally, and guidelines for adding new tests.

---

## 1. Current Testing Stack

| Layer | Framework | Runner / Utilities | Language |
|-------|-----------|--------------------|----------|
| Frontend | **Jest** with **React Testing Library** | `jest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | TypeScript |
| Backend | **Jest** with **Supertest** | `jest`, `supertest` (HTTP assertions) | TypeScript |

Both packages share a common root `package.json` that uses **Turbo** (`turbo run test`) to execute the two test suites in parallel.

---

## 2. Test Execution

### Prerequisites
- Node.js **v22** (or compatible LTS) installed.
- **pnpm** (preferred) or **npm** – the repository uses `pnpm` in CI, but any package manager works as long as the `node_modules` are installed.
- No external services are required – the backend test suite mocks the PostgreSQL pool, and the frontend tests mock API calls.

### Install dependencies
```bash
# From the repository root
pnpm install   # or `npm ci`
```

### Run all tests (frontend + backend)
```bash
pnpm test   # equivalent to `turbo run test`
```

### Run only the frontend tests
```bash
cd apps/frontend && pnpm test   # runs Jest in the frontend workspace
```

### Run only the backend tests
```bash
cd apps/backend && pnpm test   # runs Jest in the backend workspace
```

### Watch mode (useful during development)
```bash
# Frontend example
cd apps/frontend && pnpm test -- --watch
```

---

## 3. Existing Test Suites

### Frontend (`apps/frontend`)
The frontend test suite is located under `apps/frontend/tests/`.

| Test File | Covered Feature(s) | Brief Description |
|-----------|-------------------|-------------------|
| `pages/home.test.tsx` | Home page data fetching & rendering | Mocks `get_task` API, verifies that the `TaskTable` component receives data and renders rows correctly. |
| `pages/loading.test.tsx` | Loading splash screen | Checks that the loading skeleton is rendered while data is being fetched. |
| `components/task/task_table.test.tsx` | `TaskTable` component | Tests empty‑state handling, row rendering, and action button callbacks (edit/delete). |
| `components/task/task_form.test.tsx` | `TaskForm` component | Validates form field validation, submission handling, and interaction with the `add_task` API wrapper. |

All frontend tests run with **Jest** configured in `jest.config.ts` and use the `jest.setup.ts` file to add the `@testing-library/jest-dom` matchers.

### Backend (`apps/backend`)
The backend test suite lives under `apps/backend/test/`.

| Test File | Covered Endpoint(s) | Brief Description |
|-----------|--------------------|-------------------|
| `routes/task.route.test.ts` | CRUD routes under `/tasks` | Uses **Supertest** to spin up the Express app (in‑memory) and asserts successful `GET`, `POST`, `PUT`, `DELETE` operations. The database pool is mocked via `jest.mock('../src/database/db')` so no real Postgres instance is required. |

The backend Jest configuration lives in `jest.config.ts` at the root of the backend package.

---

## 4. Writing New Tests

### Frontend Guidelines
1. **Prefer React Testing Library** – query by role, label text, or test id (`data-testid`).
2. **Mock API calls** – use Jest's `jest.mock` for `src/api/client.ts` or individual actions in `src/action/`.
3. **Keep tests close to the component** – place new test files alongside the component (e.g., `src/components/my_component.test.tsx`).
4. **Use TypeScript** – typings from the project help catch prop mismatches early.
5. **Snapshot testing** – optional, but only for stable UI fragments; avoid over‑snapshotting.

### Backend Guidelines
1. **Supertest for HTTP** – spin up the Express app via the exported `app` from `src/app.ts` (or similar) and issue requests.
2. **Mock external resources** – the PostgreSQL pool (`src/database/db.ts`) is already mocked; continue this pattern for any other external services.
3. **Test edge cases** – invalid payloads, missing auth headers, and error handling pathways.
4. **Arrange‑Act‑Assert** – structure each test with clear sections to improve readability.
5. **Location** – keep new test files under `test/` mirroring the source folder hierarchy (e.g., `test/controllers/...`).

---

## 5. CI Integration
The GitHub Actions workflow **`.github/workflows/production.yaml`** includes the following steps relevant to testing:
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Run tests
  run: pnpm test   # executes both frontend and backend suites via Turbo
```
The workflow runs on every push and pull‑request, ensuring that the test suite must pass before a merge is allowed (the job fails otherwise).

> **Note:** The CI does **not** currently generate a coverage report. Adding a coverage step (`--coverage`) is optional and can be considered for future improvement.

---

## 6. Known Gaps & Recommendations
- **Coverage reports** – not produced in CI; adding `jest --coverage` would give insight into untested code.
- **Integration / End‑to‑end tests** – the current suite focuses on unit‑style tests. Consider adding Cypress or Playwright tests for full‑stack flows (e.g., creating a task via the UI and verifying persistence).
- **Backend error‑path tests** – existing tests cover happy paths; adding tests for validation failures and unexpected database errors would improve resilience.
- **Frontend component coverage** – some UI components (e.g., layout, error page) lack direct tests.

---

## 7. Quick Reference Cheat‑Sheet
| Action | Command |
|--------|---------|
| Install deps | `pnpm install` |
| Run all tests | `pnpm test` |
| Frontend only | `(cd apps/frontend && pnpm test)` |
| Backend only | `(cd apps/backend && pnpm test)` |
| Watch mode (frontend) | `(cd apps/frontend && pnpm test -- --watch)` |
| View test files | `ls apps/frontend/tests && ls apps/backend/test` |

---

*Last verified on 2026‑10‑20.*

