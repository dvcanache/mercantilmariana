# Data Model & Visual Design Tokens: UI/UX Modernization & Enhanced Brand Visibility

**Feature**: `004-improve-ui-ux-logo`  
**Date**: 2026-11-06  
**Status**: Draft  

---

## 1. Visual Design Tokens

### 1.1 Logo Dimensions & Framing
| Placement | Previous Dimensions | New Dimensions | Framing & Style |
|---|---|---|---|
| **Login Screen** | 64px (`w-16 h-16`) | 112px (`w-28 h-28`) | Circular white surface, 2px emerald border (`border-excel-mediumGreen`), shadow-xl, p-1.5 |
| **Main Window Titlebar** | 24px (`w-6 h-6`) | 36px (`w-9 h-9`) | Rounded-sm white container, border border-white/40, object-contain |
| **Public Price Catalog** | None (0px) | 56px (`w-14 h-14`) | Rounded white container, border border-excel-mediumGreen/40, high-contrast banner integration |
| **Printed Customer Sheet** | None (0px) | 64px (`w-16 h-16`) | High-res monochrome/color print layout header |

### 1.2 Bi-Monetary Color Palette & Styling
| Price Type | Background Token | Text Token | Badge / Symbol |
|---|---|---|---|
| **Official USD (BCV)** | `bg-gray-100` | `text-gray-900 font-bold` | `$ [Amount]` |
| **Retail Bolívares (Bs)** | `bg-excel-lightSage/60` | `text-excel-darkGreen font-extrabold` | `[Amount] Bs.` |
| **Cash Promo USD** | `bg-amber-100/70` | `text-amber-950 font-bold` | `$ [Amount]` |
| **Secondary Promo USD** | `bg-emerald-100/70` | `text-emerald-950 font-bold` | `$ [Amount]` |

---

## 2. Component Layout & Interaction Models

### 2.1 Window Titlebar Structure (`WindowTitleBar`)
- **Height**: 48px (`h-12`)
- **Left**:
  - Logo (`w-9 h-9`)
  - Application title & company name in bold uppercase (`tracking-wider text-xs font-bold`)
- **Right**:
  - User avatar/name (`font-semibold text-xs`)
  - Role pill badge (Master, Gerente, Vendedor) with high-contrast color coding
  - Session action button ("Cambiar Usuario / Salir") with minimum 32px height, clear hover transition

### 2.2 App Ribbon Toolbar Structure (`AppRibbon`)
- **Tab Heights**: 38px touch-friendly height
- **Active State**: Elevated white background with top emerald stripe (`border-t-2 border-excel-mediumGreen`), text in `text-excel-darkGreen font-bold`
- **Action Buttons**: Minimum 36px height with clear icon + text pairing

### 2.3 Table Sticky Header Architecture
- Container: `overflow-auto max-h-[calc(100vh-220px)]`
- Header row (`<thead>`): `sticky top-0 z-20 shadow-sm`
- Header cells (`<th>`): High contrast, uppercase text, right-aligned for numeric data
- Data rows (`<tbody> <tr>`): `hover:bg-emerald-50/50 transition-colors cursor-pointer`

---

## 3. Print Layout Projection

Media query `@media print` rules:
```css
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  .print-header {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #1E3B0F;
    padding-bottom: 12px;
    margin-bottom: 12px;
  }
  table {
    width: 100% !important;
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
```
