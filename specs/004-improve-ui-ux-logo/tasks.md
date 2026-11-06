---
description: "Task list for UI/UX Modernization & Enhanced Brand Visibility implementation"
---

# Tasks: UI/UX Modernization & Enhanced Brand Visibility

**Input**: Design documents from `specs/004-improve-ui-ux-logo/`  
**Prerequisites**: `spec.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`  

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Base styling classes, print utilities, and asset validation

- [X] T001 Configure Tailwind and CSS print media utilities and sticky table helper classes in `src/app/globals.css`
- [X] T002 [P] Verify logo asset `/public/logo.jpg` presence and high-resolution rendering properties in `public/logo.jpg`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout structure and tokenized styling required before individual user stories

**⚠️ CRITICAL**: Must complete before user story implementation begins

- [X] T003 [P] Define bi-monetary color tokens and table styling utilities in `src/app/globals.css`
- [X] T004 Adjust main layout wrapper padding and spacing to support the 48px header in `src/components/layout/AppShell.tsx`

**Checkpoint**: Foundation ready — user story implementation can begin

---

## Phase 3: User Story 1 - Prominent Brand Identity & Enlarged Logo Visibility (Priority: P1) 🎯 MVP

**Goal**: Make the Mercantil Mariana logo large, sharp, and commanding across the login screen, main application titlebar, and price list header.

**Independent Test**: Load `/login`, verify logo is scaled to 112px in a circular emerald frame; log in, verify logo is 36px in a 48px titlebar; check price list header and verify 56px branded logo.

### Implementation for User Story 1

- [X] T005 [P] [US1] Enlarge company logo to 112px (`w-28 h-28`), refine circular emerald framing, and enhance brand typography in `src/app/(auth)/login/page.tsx`
- [X] T006 [P] [US1] Expand titlebar to 48px height (`h-12`), enlarge logo to 36px (`w-9 h-9`), and refine user status badges in `src/components/layout/WindowTitleBar.tsx`
- [X] T007 [US1] Add enlarged company logo (56px) and official branding banner to `src/components/catalog/PublicPriceTable.tsx`

**Checkpoint**: User Story 1 is functional and independently testable as an MVP increment.

---

## Phase 4: User Story 2 - Modernized Bi-Monetary Table Readability & Excel Precision (Priority: P2)

**Goal**: Deliver sticky table headers, smooth row hover highlights, and distinct bi-monetary color coding for USD, Bolívares, and promotional price tiers.

**Independent Test**: Open `/lista-precios` and `/control-precios`; scroll through 50+ products, verify headers stay pinned to top, rows highlight on hover, and Bolívares vs USD columns are distinctly color-coded and right-aligned.

### Implementation for User Story 2

- [X] T008 [P] [US2] Implement sticky `<thead>` headers, smooth row-hover highlights, and right-aligned monospace bi-monetary currency columns in `src/components/catalog/PublicPriceTable.tsx`
- [X] T009 [P] [US2] Implement sticky table headers, row hover accents, and bi-monetary currency contrast in `src/components/pricing/PriceControlTable.tsx`
- [X] T010 [US2] Update price control master page container scroll behavior to support sticky header pinning in `src/app/(dashboard)/control-precios/page.tsx`

**Checkpoint**: User Stories 1 and 2 are functional and independently testable.

---

## Phase 5: User Story 3 - Touch & Ergonomic Usability on Counter Terminals and Tablets (Priority: P3)

**Goal**: Provide comfortable 36-40px touch targets, responsive search filters, and height-constrained modal dialogs suitable for sales counter tablets and touchscreens.

**Independent Test**: On a tablet viewport (1024x768), verify navigation tabs, search inputs, and modal dialogs are easy to tap and do not overflow or clip screen boundaries.

### Implementation for User Story 3

- [X] T011 [P] [US3] Increase ribbon navigation tab heights to 38px and action buttons to minimum 36px tap targets in `src/components/layout/AppRibbon.tsx`
- [X] T012 [P] [US3] Update search bars, category filters, and action buttons to 36px minimum touch targets in `src/components/users/UserManagementTable.tsx`
- [X] T013 [US3] Ensure modal dialogs (`UserFormModal.tsx`, `RateUpdateModal.tsx`, `SalesFormModal.tsx`) have `max-h-[90vh] overflow-y-auto` responsive constraints for tablet viewports

**Checkpoint**: User Stories 1, 2, and 3 are functional and independently testable.

---

## Phase 6: User Story 4 - High-Fidelity Printable Customer Catalog Layout (Priority: P4)

**Goal**: Deliver a clean, professional paper printout of the public price catalog with the company logo, exchange rates, and zero web navigation clutter.

**Independent Test**: Click "Imprimir Catálogo" on `/lista-precios`; verify that print preview hides web headers, displays the logo header, and formats cleanly on Letter/A4 pages.

### Implementation for User Story 4

- [X] T014 [P] [US4] Add `@media print` rules hiding web navigation ribbons, search bars, and status bar in `src/app/globals.css`
- [X] T015 [US4] Format the printable customer price catalog with executive header, enlarged logo, and page-break rules in `src/components/catalog/PublicPriceTable.tsx`

**Checkpoint**: All user stories are functional and integrated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual consistency verification, responsive testing, and regression suite execution

- [X] T016 [P] Visual responsiveness and contrast audit across tablet and desktop viewports in `src/components/layout/AppShell.tsx`
- [X] T017 Execute test suite `pnpm test` and production build `pnpm build` to verify zero visual or compilation regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS** all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
  - Can proceed sequentially (US1 → US2 → US3 → US4) or in parallel on separate files.
- **Polish (Phase 7)**: Depends on all user story phases being completed.

### User Story Dependencies

- **User Story 1 (P1 - MVP)**: Directly addresses the primary request ("haz el logo mas grande"). Can be tested on login and header immediately.
- **User Story 2 (P2)**: Modernizes table readability and sticky headers.
- **User Story 3 (P3)**: Enhances touch ergonomics across ribbons, filters, and modals.
- **User Story 4 (P4)**: Delivers print styling built on top of the branded catalog header.

---

## Parallel Opportunities

- **Phase 1**: T001 (`globals.css`) and T002 (`logo.jpg`) can run in parallel.
- **Phase 3 (US1)**: T005 (`login/page.tsx`) and T006 (`WindowTitleBar.tsx`) can run in parallel.
- **Phase 4 (US2)**: T008 (`PublicPriceTable.tsx`) and T009 (`PriceControlTable.tsx`) can run in parallel.
- **Phase 5 (US3)**: T011 (`AppRibbon.tsx`) and T012 (`UserManagementTable.tsx`) can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1: Setup (T001 - T002)
2. Complete Phase 2: Foundational (T003 - T004)
3. Complete Phase 3: User Story 1 (T005 - T007)
4. **STOP & VALIDATE**: Verify enlarged logo on login screen, main titlebar, and price list header.

### Incremental Delivery
1. Foundation + US1 (MVP): High-visibility branding and enlarged logo across all primary screens.
2. Add US2: Sticky table headers, row hover, and bi-monetary color contrast.
3. Add US3: 36-40px touch ergonomics and tablet modal constraints.
4. Add US4 & Polish: Executive print catalog formatting and build validation.
