---
description: "Task list for User Authentication and Role-Based Access Control implementation"
---

# Tasks: User Authentication and Role-Based Access Control

**Input**: Design documents from `specs/002-user-access-management/`  
**Prerequisites**: `spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`  

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema indexing and seed infrastructure for multi-user credentials

- [X] T001 Verify and add user index `@@index([role, active])` in `prisma/schema.prisma` and execute `pnpm prisma:generate`
- [X] T002 [P] Update seed script in `scripts/seed-from-excel.ts` to ensure default Master (`admin@mercantilmariana.com` / `admin123`, `ADMIN`), Manager (`gerente@mercantilmariana.com` / `gerente123`, `MANAGER`), and Sales Clerk (`vendedor@mercantilmariana.com` / `vendedor123`, `SALES_CLERK`) accounts are seeded with valid bcrypt hashes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core cryptographic helpers, token verification, and session state endpoints required by all user stories

**⚠️ CRITICAL**: Must complete before user story implementation begins

- [X] T003 [P] Implement core authentication helper functions (`hashPassword`, `comparePassword`, `createSessionToken`, `verifySessionToken`, `getSessionUser`) with full `UserRole` typing in `src/lib/auth.ts`
- [X] T004 [P] Create unit tests for password hashing and JWT token issuance/verification in `tests/unit/auth.test.ts`
- [X] T005 Create session inspection endpoint `GET /api/auth/me` with cookie and Bearer token resolution in `src/app/api/auth/me/route.ts`
- [X] T006 Create session logout endpoint `POST /api/auth/logout` that clears the `session_token` cookie in `src/app/api/auth/logout/route.ts`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - Secure Authentication & Session Switching (Priority: P1) 🎯 MVP

**Goal**: Deliver a dedicated login screen, protect all routes against unauthenticated access, direct users to their role-appropriate destination, and support quick session logout / user switching from any screen.

**Independent Test**: Unauthenticated navigation to any protected route redirects to `/login`. Submitting valid credentials signs the user in and loads their permitted interface. Clicking "Cambiar Usuario" / "Salir" in the titlebar clears the session and returns to `/login`.

### Tests for User Story 1

- [X] T007 [P] [US1] Create integration test for login authentication, cookie issuance, and logout in `tests/integration/auth-flow.test.ts`

### Implementation for User Story 1

- [X] T008 [US1] Update login route `POST /api/auth/login` to query database users, verify password hash with bcrypt, reject deactivated users (`active === false`) with HTTP 403, issue `session_token` cookie, and return target `redirectUrl` (`/lista-precios` for `SALES_CLERK`, `/control-precios` for `ADMIN`/`MANAGER`) in `src/app/api/auth/login/route.ts`
- [X] T009 [US1] Update Edge middleware in `src/middleware.ts` to enforce authentication on all protected pages, redirecting unauthenticated visitors to `/login` while whitelisting `/login`, `/api/auth/login`, `/_next`, and `/logo.jpg`
- [X] T010 [US1] Update login page UI in `src/app/(auth)/login/page.tsx` to handle authentication submission, show descriptive error banners on invalid credentials, and navigate to the returned `redirectUrl`
- [X] T011 [US1] Update titlebar component in `src/components/layout/WindowTitleBar.tsx` to display the active user's name, role badge, and a "Cambiar Usuario" / "Salir" button
- [X] T012 [US1] Update `src/components/layout/AppShell.tsx` to fetch the current session from `GET /api/auth/me` on mount, pass user context to child components, and handle session termination via `POST /api/auth/logout`

**Checkpoint**: User Story 1 is functional and independently testable as an MVP increment.

---

## Phase 4: User Story 2 - Master User Management & Credential Administration (Priority: P2)

**Goal**: Allow Master administrators to view all registered staff accounts, create new users with credentials and assigned roles, edit profiles, reset passwords, delete/deactivate users, and prevent accidental deletion of the last active Master account.

**Independent Test**: Log in as Master (`ADMIN`), navigate to `/usuarios`, create a new user with role `SALES_CLERK`, edit their name, reset their password, and verify they can log in. Then attempt to delete or demote the sole active Master account and verify the system blocks the action with an error.

### Tests for User Story 2

- [X] T013 [P] [US2] Create integration tests for Master user CRUD operations and sole Master lockout prevention guardrail in `tests/integration/users-api.test.ts`

### Implementation for User Story 2

- [X] T014 [US2] Implement user roster and user creation API `GET /api/users` and `POST /api/users` with `ADMIN` role protection, email uniqueness checks, and bcrypt password hashing in `src/app/api/users/route.ts`
- [X] T015 [US2] Implement user update and deletion API `PUT /api/users/[id]` and `DELETE /api/users/[id]` with `ADMIN` role check and sole active Master protection guardrail (`prisma.user.count({ where: { role: 'ADMIN', active: true } }) <= 1`) in `src/app/api/users/[id]/route.ts`
- [X] T016 [P] [US2] Create user creation and editing dialog modal `src/components/users/UserFormModal.tsx` with inputs for full name, email/username, password, and role selector (`ADMIN`, `MANAGER`, `SALES_CLERK`)
- [X] T017 [P] [US2] Create user roster table component `src/components/users/UserManagementTable.tsx` displaying all staff accounts, role badges, active/inactive statuses, and edit/delete action triggers
- [X] T018 [US2] Create Master user administration page in `src/app/(dashboard)/usuarios/page.tsx` integrating `UserManagementTable` and `UserFormModal` with confirmation dialogs and error alerts
- [X] T019 [US2] Update ribbon toolbar in `src/components/layout/AppRibbon.tsx` to add the "Usuarios" navigation tab visible strictly to users with `role === 'ADMIN'`

**Checkpoint**: User Stories 1 and 2 are functional and independently testable.

---

## Phase 5: User Story 3 - Restricted "Price List" Role Access (Priority: P3)

**Goal**: Strictly restrict users assigned to the "Price List Viewer" (`SALES_CLERK`) category so they can only access the price list, strip all sensitive supplier costs and margins from data payloads, and block access to unauthorized pages and APIs.

**Independent Test**: Log in as a user with `SALES_CLERK` role. Verify that only the "Lista de Precios" tab is visible. Verify that typing `/control-precios` or `/usuarios` in the address bar redirects to `/lista-precios`. Inspect `GET /api/products` network response and verify `supplierCostUsd` and `targetMarginPercentage` are completely stripped/null.

### Tests for User Story 3

- [X] T020 [P] [US3] Create integration tests for restricted role isolation and payload sanitization in `tests/integration/rbac-isolation.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Update product catalog API `GET /api/products` in `src/app/api/products/route.ts` to inspect session user role; when caller is `SALES_CLERK`, return precomputed retail prices while omitting `supplierCostUsd` and `targetMarginPercentage`
- [X] T022 [US3] Update Edge middleware in `src/middleware.ts` to intercept `SALES_CLERK` users attempting to access restricted pages (`/control-precios`, `/resumen-ganancias`, `/punto-equilibrio`, `/registro-ventas`, `/usuarios`) and redirect them to `/lista-precios`
- [X] T023 [US3] Update ribbon toolbar in `src/components/layout/AppRibbon.tsx` to display only the "Lista de Precios" tab for `SALES_CLERK` and hide rate adjustment and new sale modals
- [X] T024 [US3] Update customer price table in `src/components/catalog/PublicPriceTable.tsx` to display prices from sanitized projections without requiring raw supplier costs or margins

**Checkpoint**: User Stories 1, 2, and 3 are functional and independently testable.

---

## Phase 6: User Story 4 - Master Comprehensive Information Oversight (Priority: P4)

**Goal**: Ensure Master administrators retain full, unrestricted visibility and editing rights over all financial formulas, margin configurations, POS logs, break-even analyses, and user administration.

**Independent Test**: Log in as Master (`ADMIN`) and verify that all tabs, calculation matrices, and administrative controls are visible, editable, and functional without restriction.

### Implementation for User Story 4

- [X] T025 [US4] Update price control view in `src/app/(dashboard)/control-precios/page.tsx` to ensure full margin, cost, and rate manipulation is available to `ADMIN` users
- [X] T026 [US4] Verify and ensure in `src/components/layout/AppShell.tsx` and ribbon actions that Master users have full access to `RateUpdateModal` and `SalesFormModal`

**Checkpoint**: All user stories are functional and integrated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: System documentation, error handling, and end-to-end verification

- [X] T027 [P] Update `README.md` with instructions on multi-user roles, default seeded credentials, and RBAC policies
- [X] T028 [P] Enhance error notifications and session expiration handling in `src/components/layout/AppShell.tsx` when a session cookie expires
- [X] T029 Execute full test suite via `pnpm test` and execute all verification scenarios in `specs/002-user-access-management/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS** all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - User stories can proceed sequentially (US1 → US2 → US3 → US4) or in parallel where files do not conflict.
- **Polish (Phase 7)**: Depends on all user story phases being completed.

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Depends on Foundational (Phase 2). Delivers login, logout/switch user, and base route gating.
- **User Story 2 (P2)**: Depends on US1 (requires authenticated Master session for user management).
- **User Story 3 (P3)**: Depends on US1 (requires session role claims for data sanitization and route restriction).
- **User Story 4 (P4)**: Depends on US1 and US2 (ensures Master oversight across all modules).

---

## Parallel Opportunities

- **Phase 1**: T002 can run in parallel with T001.
- **Phase 2**: T003 and T004 can run in parallel.
- **Phase 3 (US1)**: Test task T007 can be written in parallel with initial component review.
- **Phase 4 (US2)**: Component tasks T016 (`UserFormModal.tsx`) and T017 (`UserManagementTable.tsx`) can be developed in parallel with backend endpoints T014 and T015.
- **Phase 5 (US3)**: Test task T020 can be written in parallel with T021.
- **Phase 7 (Polish)**: Documentation T027 and error handling T028 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (T001 - T002)
2. Complete Phase 2: Foundational (T003 - T006)
3. Complete Phase 3: User Story 1 (T007 - T012)
4. **STOP & VALIDATE**: Verify login, session cookie, redirection, and logout/user switching.

### Incremental Delivery
1. Foundation + US1 (MVP): Authentication, session cookies, logout, and route protection.
2. Add US2: Master User Management (`/usuarios`, CRUD, sole Master protection).
3. Add US3: Restricted "Price List" isolation (data sanitization, route restriction).
4. Add US4 & Polish: Master oversight verification, test suite execution, and documentation.
