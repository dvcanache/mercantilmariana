# Quickstart & Verification Guide: UI/UX Modernization & Enhanced Brand Visibility

**Feature**: `004-improve-ui-ux-logo`  
**Date**: 2026-11-06  
**Status**: Ready for Verification  

---

## Prerequisites & Setup

1. **Start Development Server**:
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in a browser.

---

## Verification Scenarios

### Scenario 1: Enlarged Logo on Login Screen
1. Open `http://localhost:3000/login` in your browser.
2. **Expected Outcome**:
   - The Mercantil Mariana logo is prominently displayed inside a crisp 112px circular frame (`w-28 h-28`).
   - The brand title "MERCANTIL MARIANA" is bold, sharp, and clearly legible.
   - Input fields and the "Acceder al Sistema" button have comfortable, touch-friendly heights (minimum 40px).

---

### Scenario 2: Main Application Header & Logo Visibility
1. Log in with any account (e.g. click "Master Admin" or "Vendedor").
2. **Expected Outcome**:
   - The top titlebar has an increased height (`h-12` / 48px), giving it a more executive presence.
   - The company logo is enlarged to 36px (`w-9 h-9`) with crisp framing next to the system title.
   - The active user name, role badge, and "Cambiar Usuario / Salir" button are cleanly aligned with comfortable touch padding.

---

### Scenario 3: Public Price Table Branding & Sticky Headers
1. Navigate to **"Lista de Precios"** (`/lista-precios`).
2. **Expected Outcome**:
   - The header banner displays the Mercantil Mariana logo (56px) alongside the official title and BCV exchange rate.
   - Scroll down through the product catalog.
   - The table header row (`<thead>`) remains pinned (sticky) at the top of the grid with a subtle shadow separating it from scrolling rows.

---

### Scenario 4: Bi-Monetary Color Contrast & Row Hover
1. On the price table, observe the currency columns:
   - **PRECIO BCV ($)** is rendered with neutral slate background and bold dark text.
   - **PRECIO VENTA (Bolívares)** is highlighted in signature emerald green with prominent bold font and "Bs." suffix.
   - **PROMO DIVISAS ($)** is rendered with a warm amber tone.
   - **PROMO 2 EN DIVISAS** is rendered with a mint emerald tone.
2. Move the mouse across products.
3. **Expected Outcome**:
   - The active row highlights smoothly with an accent tint, making horizontal reading across columns effortless.

---

### Scenario 5: Clean Print Preview Output
1. On `/lista-precios`, click the **"Imprimir Catálogo"** button (or press `Ctrl+P` / `Cmd+P`).
2. **Expected Outcome in Print Preview**:
   - Top window titlebar, ribbon navigation tabs, search input, and status bar are completely hidden.
   - The document renders a clean, executive print header featuring the enlarged logo, store name, exchange rate reference, and date.
   - The table fills standard page width (Letter / A4) with neat margins and no truncated columns.

---

### Scenario 6: Tablet Viewport & Touch Ergonomics
1. Open Browser DevTools and switch to responsive device mode (e.g., iPad Mini or 1024x768).
2. **Expected Outcome**:
   - All navigation tabs, search filters, and action buttons have at least 36px touch heights.
   - No horizontal text overlapping or visual clipping occurs.
