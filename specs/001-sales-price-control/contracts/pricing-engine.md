# Technical Contract: Financial Calculation Engine (`pricing-engine.ts`)

**Feature**: `001-sales-price-control`
**Date**: 2026-11-05
**Status**: Draft

The pricing engine is a pure, side-effect-free TypeScript module used across client components and server route handlers.

```typescript
export interface ExchangeRates {
  supplierReplacementRate: number; // Tasa Compra Variante (Bs/$)
  officialBcvRate: number;         // Tasa Venta Oficial BCV (Bs/$)
  promoDiscountPercentage: number; // e.g. 0.06 (6%)
}

export interface ProductFinancialInput {
  supplierCostUsd: number;         // B: Precio de Compra
  targetMarginPercentage: number;  // H: % Margen de Contribución (0.00 - 0.999)
}

export interface CalculatedPricingOutput {
  factor: number;                  // F: Tasa BCV / Tasa Compra
  adjustedUnitCostUsd: number;     // G: ROUNDUP(Costo * Factor, 0)
  bcvPriceUsd: number;             // I: ROUNDUP(Costo / (1 - Margen), 0)
  salePriceBs: number;             // J: ROUNDUP(Precio BCV * Tasa BCV, 0)
  grossMarginBs: number;           // K: ROUNDUP(Precio Bs - (Costo * Tasa BCV), 0)
  promoPriceUsd: number;           // L: ROUNDUP(Precio Bs / Tasa Compra, 0)
  promoPriceUsd2: number;          // M: ROUNDUP(Promo * (1 - Descuento), 0)
  grossMarginPromoUsd: number;     // N: ROUNDUP(Promo - Costo, 0)
}

export interface FixedCostItemInput {
  id: string;
  concept: string;
  monthlyAmountUsd: number;
}

export interface BreakEvenOutput {
  totalFixedCostsUsd: number;
  totalFixedCostsBs: number;
  averageContributionMargin: number;
  breakEvenMonthlyUsd: number;
  breakEvenMonthlyBs: number;
  dailyTargetMinUsd: number;
  dailyTargetMinBs: number;
}
```

### Formula Execution Rules:
1. `calculateExchangeFactor(rates: ExchangeRates): number`:
   - Returns `rates.officialBcvRate / rates.supplierReplacementRate`.
2. `roundUp(value: number, decimals: number = 0): number`:
   - Emulates Excel `ROUNDUP(val, decimals)`. For integers (`decimals = 0`), `Math.ceil(val)`.
3. `calculateProductPricing(input: ProductFinancialInput, rates: ExchangeRates): CalculatedPricingOutput`:
   - Implements exact Excel formulas for row columns F through N.
4. `calculateBreakEven(fixedCosts: FixedCostItemInput[], avgMargin: number, officialBcvRate: number): BreakEvenOutput`:
   - Calculates monthly break-even sales and daily minimum target with zero division safeguards.
