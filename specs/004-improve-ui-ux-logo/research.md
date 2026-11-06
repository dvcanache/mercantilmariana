# Phase 0 Research & Technical Decisions: UI/UX Modernization & Enhanced Brand Visibility

**Feature**: `004-improve-ui-ux-logo`  
**Date**: 2026-11-06  
**Status**: Completed  

---

## 1. Logo Sizing & Brand Placement Strategy

### Decision
1. **Login Screen (`src/app/(auth)/login/page.tsx`)**:
   - Scale the logo container from `w-16 h-16` (64px) to `w-28 h-28` (112px).
   - Frame in a white circle with a 2px emerald green accent border (`border-excel-mediumGreen`), elevated shadow, and generous vertical breathing room (`mb-3`).
   - Increase store name typography to `text-base font-extrabold tracking-wider`.
2. **Main Application Header (`src/components/layout/WindowTitleBar.tsx`)**:
   - Increase titlebar height from `h-9` (36px) to `h-12` (48px).
   - Scale logo from `w-6 h-6` (24px) to `w-9 h-9` (36px) with rounded border framing.
   - Refine user badge and "Cambiar Usuario / Salir" button with higher contrast and 36px touch height.
3. **Public Price Catalog (`src/components/catalog/PublicPriceTable.tsx`)**:
   - Add the official logo (`w-14 h-14` / 56px) directly into the customer-facing catalog header and printable document layout.

### Rationale
- Solves the primary user request: "haz el logo mas grande" (make the logo bigger).
- Ensures the brand is immediately recognizable from counter distances (1+ meter) and on physical paper quotes.

---

## 2. Table Usability & Sticky Headers

### Decision
1. **Sticky Header Implementation**:
   - Table `<thead>` elements configured with `sticky top-0 z-10` and `bg-excel-darkGreen` (or respective section palette).
   - Apply a subtle bottom elevation shadow (`shadow-sm`) to delineate pinned headers from scrolling content.
2. **Horizontal Scanning Row Hover**:
   - Implement `hover:bg-emerald-50/60 transition-colors` across all table `<tr>` rows.
   - Keep borders light (`border-b border-gray-200`) and numbers right-aligned with monospace formatting.

### Rationale
- Users frequently browse catalogs with dozens of items. Sticky headers eliminate lost context while scrolling, and row highlights prevent cross-row reading errors.

---

## 3. Bi-Monetary Color Hierarchy & Typography

### Decision
Apply a cohesive color and typography system across all pricing views:
- **Official BCV (USD)**: High-contrast charcoal/slate with gray badge (`bg-gray-100 text-gray-900 font-mono font-bold`).
- **Retail Bolívares (Bs.)**: Signature Mercantil Mariana green (`bg-excel-lightSage/60 text-excel-darkGreen font-mono font-extrabold`).
- **Promo Cash (USD)**: Warm amber accent (`bg-amber-100/70 text-amber-950 font-mono font-bold`).
- **Secondary Promo (USD)**: Fresh mint/emerald accent (`bg-emerald-100/70 text-emerald-950 font-mono font-bold`).

### Rationale
- Prevents staff and customer confusion between foreign currency ($) and local currency (Bs.) quotes.

---

## 4. Touch & Ergonomics for Counter Workstations / Tablets

### Decision
- Standardize all interactive controls (ribbon tabs, search bars, category filters, action buttons, dialog buttons) to a minimum height of 36px (touch target standard: 36-40px).
- Add clear `:focus-visible` rings with emerald accent for keyboard and barcode-scanner navigation.
- Ensure modal dialogs (`UserFormModal`, `RateUpdateModal`, `SalesFormModal`) have maximum height constraints (`max-h-[90vh] overflow-y-auto`) to fit tablet screens without clipping action buttons.

---

## 5. Professional Print Layout (`@media print`)

### Decision
- Hide all interactive UI (`no-print`): navigation ribbons, search inputs, user buttons, status bar.
- Format the print view with an executive white background, crisp black text, enlarged company logo, official BCV rate, and clean table borders.
- Add CSS page-break rules (`page-break-inside: avoid; break-inside: avoid;`) so product rows do not split across physical paper page breaks.
