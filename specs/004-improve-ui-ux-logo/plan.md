# Implementation Plan: UI/UX Modernization & Enhanced Brand Visibility

**Branch**: `004-improve-ui-ux-logo` | **Date**: 2026-11-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-improve-ui-ux-logo/spec.md`

## Summary

Modernize the user interface and user experience across Mercantil Mariana's bi-monetary system with an emphasis on prominent brand presentation:
1. **Brand Visibility**: Substantially enlarge the Mercantil Mariana logo on the login card (`w-28 h-28` / 112px), in the main application titlebar (`w-9 h-9` / 36px in a 48px header), and introduce the logo into the customer-facing public price catalog header (`w-14 h-14` / 56px).
2. **Table Ergonomics**: Implement sticky/pinned table headers (`sticky top-0 z-10`), smooth row hover highlights, and right-aligned monospace typography for numerical figures.
3. **Bi-Monetary Visual Hierarchy**: Establish distinct, high-contrast color coding for official BCV USD ($), retail Bolívares (Bs.), cash promo prices, and secondary promo tiers to eliminate quoting ambiguity.
4. **Counter Ergonomics & Print Optimization**: Enforce minimum 36-40px touch targets for sales counter tablets, and provide dedicated print styles (`@media print`) that produce executive paper catalogs with branding and zero web clutter.

## Technical Context

**Language/Version**: TypeScript 5.6, Next.js 14.2 (App Router), React 18, Tailwind CSS 3.4  
**Primary Dependencies**: Tailwind CSS, Lucide React, Next.js Image component  
**Storage**: N/A (Frontend presentation, responsive layout, and print CSS)  
**Testing**: Vitest 2.1 (`pnpm test`), Next.js production build (`pnpm build`)  
**Target Platform**: Desktop Workstations and Sales Counter Tablets across modern browsers  
**Project Type**: Fullstack Web Application (UI/UX presentation layer)  
**Performance Goals**: 60fps scrolling with sticky table headers, zero layout shift (CLS < 0.05), instant print preview rendering  
**Constraints**: Preservation of the Windows 10 / Excel aesthetic; print output must fit Letter / A4 without clipping  
**Scale/Scope**: System-wide design polish touching login, titlebar, ribbon navigation, price tables, and modals  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicity & YAGNI**: Pass. Leverages existing Tailwind CSS utility classes and Next.js Image components without adding heavy third-party UI libraries.
- **Brand Authority**: Pass. The company logo is prominently placed and appropriately scaled at all primary user touchpoints.
- **Ergonomics & Accessibility**: Pass. Touch targets meet 36-40px guidelines; contrast ratios exceed 4.5:1.

## Project Structure

### Documentation (this feature)

```text
specs/004-improve-ui-ux-logo/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Visual research & design decisions
├── data-model.md        # Design tokens, color palette, and layout specs
├── quickstart.md        # Step-by-step verification guide
├── contracts/           # Component layout and visual contracts
│   └── ui-contracts.md  # Detailed visual specs per component
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Enlarged logo (112px), acrylic card, 40px inputs
│   ├── (dashboard)/
│   │   ├── lista-precios/page.tsx    # Public price list page
│   │   └── control-precios/page.tsx  # Master price control sheet with sticky headers
│   └── globals.css                   # Global print media queries and sticky table styling
└── components/
    ├── layout/
    │   ├── WindowTitleBar.tsx        # 48px height, 36px logo, high-contrast badges
    │   └── AppRibbon.tsx             # 38px touch tabs and refined action button styling
    ├── catalog/
    │   └── PublicPriceTable.tsx      # Branded header with logo, sticky thead, bi-monetary contrast
    └── pricing/
        └── PriceControlTable.tsx     # Sticky column headers and row-hover highlighting
```

**Structure Decision**: Clean component-level enhancements utilizing Tailwind CSS styling, responsive utilities, and standard Next.js asset optimization.

## Complexity Tracking

> No unjustified violations. System adheres strictly to modern web UI and Tailwind CSS best practices.
