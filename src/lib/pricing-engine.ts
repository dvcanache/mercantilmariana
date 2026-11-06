/**
 * Mercantil Mariana - Pure Financial Pricing Engine
 * Implements exact Excel calculations with upward integer rounding (ROUNDUP)
 * Source reference: CONTROL_DE_PRECIOS_DE_VENTA (4).xlsx
 */

export interface ExchangeRates {
  supplierReplacementRate: number; // Tasa Compra Variante (Bs/$) e.g. 970.00
  officialBcvRate: number;         // Tasa Venta Oficial BCV (Bs/$) e.g. 849.56
  promoDiscountPercentage: number; // e.g. 0.06 (6%)
}

export interface ProductPricingInput {
  supplierCostUsd: number;         // Col B: Precio de Compra
  targetMarginPercentage: number;  // Col H: % Margen de Contribución
}

export interface CalculatedPricingOutput {
  factor: number;                  // Col F: Factor de Cambio = Tasa BCV / Tasa Compra
  adjustedUnitCostUsd: number;     // Col G: Costo Unitario = ROUNDUP(B * F, 0)
  targetMarginPercentage: number;  // Col H: % Margen
  bcvPriceUsd: number;             // Col I: PRECIO BCV = ROUNDUP(G / (1 - H), 0)
  salePriceBs: number;             // Col J: PRECIO DE VENTA (Bs) = ROUNDUP(I * Tasa BCV, 0)
  grossMarginBs: number;           // Col K: Margen Bruto Bs = ROUNDUP(J - (G * Tasa BCV), 0)
  promoPriceUsd: number;           // Col L: PROMO EN DIVISAS = ROUNDUP(J / Tasa Compra, 0)
  promoPriceUsd2: number;          // Col M: PRECIO PROMOCION EN DIVISAS 2 = ROUNDUP(L * (1 - Desc), 0)
  grossMarginPromoUsd: number;     // Col N: Margen Bruto Promo $ = ROUNDUP(L - G, 0)
}

export interface FixedCostItemInput {
  id?: string;
  concept: string;
  monthlyAmountUsd: number;
  active?: boolean;
}

export interface BreakEvenOutput {
  totalFixedCostsUsd: number;
  totalFixedCostsBs: number;
  averageContributionMargin: number;
  breakEvenMonthlyUsd: number;
  breakEvenMonthlyBs: number;
  dailyTargetMinUsd: number;
  dailyTargetMinBs: number;
  costBreakdown: {
    concept: string;
    monthlyAmountUsd: number;
    monthlyAmountBs: number;
    percentageOfTotal: number;
  }[];
}

/**
 * Emulates Excel ROUNDUP(number, num_digits)
 * For num_digits = 0, rounds away from zero to the next integer.
 */
export function roundUp(val: number, decimals: number = 0): number {
  if (!isFinite(val) || isNaN(val) || val === 0) return 0;
  const multiplier = Math.pow(10, decimals);
  return val > 0
    ? Math.ceil(val * multiplier) / multiplier
    : Math.floor(val * multiplier) / multiplier;
}

/**
 * Calculates the bi-monetary exchange factor: Tasa Venta BCV / Tasa Compra Variante
 */
export function calculateExchangeFactor(rates: ExchangeRates): number {
  if (!rates.supplierReplacementRate || rates.supplierReplacementRate <= 0) return 1;
  return rates.officialBcvRate / rates.supplierReplacementRate;
}

/**
 * Calculates all row columns (F to N) for a product given supplier cost, target margin and exchange rates
 */
export function calculateProductPricing(
  input: ProductPricingInput,
  rates: ExchangeRates
): CalculatedPricingOutput {
  const factor = calculateExchangeFactor(rates);
  const cost = input.supplierCostUsd || 0;
  const margin = input.targetMarginPercentage || 0;
  const discount = rates.promoDiscountPercentage || 0;

  // Col G: Costo Unitario = IF(B4>0, ROUNDUP(B4*F4, 0), 0)
  const adjustedUnitCostUsd = cost > 0 ? roundUp(cost * factor, 0) : 0;

  // Col I: PRECIO BCV = IF(G4>0, ROUNDUP(IF(H4<1, G4/(1-H4), G4), 0), 0)
  let bcvPriceUsd = 0;
  if (adjustedUnitCostUsd > 0) {
    const rawBcv = margin < 1 ? adjustedUnitCostUsd / (1 - margin) : adjustedUnitCostUsd;
    bcvPriceUsd = roundUp(rawBcv, 0);
  }

  // Col J: PRECIO DE VENTA (Bolívares) = IF(I4>0, ROUNDUP(I4*$J$2, 0), 0)
  const salePriceBs = bcvPriceUsd > 0 ? roundUp(bcvPriceUsd * rates.officialBcvRate, 0) : 0;

  // Col K: Margen Bruto Bs. = IF(J4>0, ROUNDUP(J4-(G4*$J$2), 0), 0)
  const grossMarginBs =
    salePriceBs > 0 ? roundUp(salePriceBs - adjustedUnitCostUsd * rates.officialBcvRate, 0) : 0;

  // Col L: PROMO EN DIVISAS = IF(J4>0, ROUNDUP(J4/$J$1, 0), 0)
  const promoPriceUsd =
    salePriceBs > 0 && rates.supplierReplacementRate > 0
      ? roundUp(salePriceBs / rates.supplierReplacementRate, 0)
      : 0;

  // Col M: PRECIO PROMOCION EN DIVISAS 2 = IF(L4>0, ROUNDUP(L4*(1-$I$2), 0), 0)
  const promoPriceUsd2 =
    promoPriceUsd > 0 ? roundUp(promoPriceUsd * (1 - discount), 0) : 0;

  // Col N: Margen Bruto Promo $ = IF(L4>0, ROUNDUP(L4-G4, 0), 0)
  const grossMarginPromoUsd =
    promoPriceUsd > 0 ? roundUp(promoPriceUsd - adjustedUnitCostUsd, 0) : 0;

  return {
    factor,
    adjustedUnitCostUsd,
    targetMarginPercentage: margin,
    bcvPriceUsd,
    salePriceBs,
    grossMarginBs,
    promoPriceUsd,
    promoPriceUsd2,
    grossMarginPromoUsd,
  };
}

/**
 * Computes break-even analysis from fixed operational costs and average contribution margin
 */
export function calculateBreakEven(
  fixedCosts: FixedCostItemInput[],
  averageMargin: number,
  officialBcvRate: number
): BreakEvenOutput {
  const activeCosts = fixedCosts.filter((c) => c.active !== false);
  const totalFixedCostsUsd = activeCosts.reduce(
    (acc, curr) => acc + (Number(curr.monthlyAmountUsd) || 0),
    0
  );
  const totalFixedCostsBs = roundUp(totalFixedCostsUsd * officialBcvRate, 2);

  const costBreakdown = activeCosts.map((c) => {
    const amount = Number(c.monthlyAmountUsd) || 0;
    return {
      concept: c.concept,
      monthlyAmountUsd: amount,
      monthlyAmountBs: roundUp(amount * officialBcvRate, 2),
      percentageOfTotal: totalFixedCostsUsd > 0 ? amount / totalFixedCostsUsd : 0,
    };
  });

  const effectiveMargin = averageMargin > 0 ? averageMargin : 0.25;
  const breakEvenMonthlyUsd = totalFixedCostsUsd / effectiveMargin;
  const breakEvenMonthlyBs = totalFixedCostsBs / effectiveMargin;

  return {
    totalFixedCostsUsd,
    totalFixedCostsBs,
    averageContributionMargin: averageMargin,
    breakEvenMonthlyUsd: roundUp(breakEvenMonthlyUsd, 2),
    breakEvenMonthlyBs: roundUp(breakEvenMonthlyBs, 2),
    dailyTargetMinUsd: roundUp(breakEvenMonthlyUsd / 30, 2),
    dailyTargetMinBs: roundUp(breakEvenMonthlyBs / 30, 2),
    costBreakdown,
  };
}
