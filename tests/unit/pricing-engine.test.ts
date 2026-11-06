import { describe, it, expect } from "vitest";
import {
  calculateProductPricing,
  calculateBreakEven,
  calculateExchangeFactor,
  roundUp,
} from "../../src/lib/pricing-engine";

describe("Pricing Engine - Excel Parity Tests", () => {
  const rates = {
    supplierReplacementRate: 970.0,
    officialBcvRate: 849.56,
    promoDiscountPercentage: 0.06,
  };

  it("calculates correct exchange factor", () => {
    const factor = calculateExchangeFactor(rates);
    expect(factor).toBeCloseTo(0.875835, 5);
  });

  it("emulates Excel ROUNDUP correctly", () => {
    expect(roundUp(157.65, 0)).toBe(158);
    expect(roundUp(315.2, 0)).toBe(316);
    expect(roundUp(268460.96, 0)).toBe(268461);
    expect(roundUp(0, 0)).toBe(0);
  });

  it("matches Excel row for Colchón Matrimonial Ortopédico (50% margin)", () => {
    const output = calculateProductPricing(
      { supplierCostUsd: 180, targetMarginPercentage: 0.5 },
      rates
    );

    expect(output.adjustedUnitCostUsd).toBe(158);
    expect(output.bcvPriceUsd).toBe(316);
    expect(output.salePriceBs).toBe(268461);
    expect(output.grossMarginBs).toBe(134231);
    expect(output.promoPriceUsd).toBe(277);
    expect(output.promoPriceUsd2).toBe(261);
    expect(output.grossMarginPromoUsd).toBe(119);
  });

  it("matches Excel row for Colchón Individual Semi-Ortopédico (50% margin)", () => {
    const output = calculateProductPricing(
      { supplierCostUsd: 95, targetMarginPercentage: 0.5 },
      rates
    );

    expect(output.adjustedUnitCostUsd).toBe(84);
    expect(output.bcvPriceUsd).toBe(168);
    expect(output.salePriceBs).toBe(142727);
    expect(output.grossMarginBs).toBe(71364);
    expect(output.promoPriceUsd).toBe(148);
    expect(output.promoPriceUsd2).toBe(140);
  });

  it("matches Excel row for Colchón Queen Size Pillow Top (38% margin)", () => {
    const output = calculateProductPricing(
      { supplierCostUsd: 240, targetMarginPercentage: 0.38 },
      rates
    );

    expect(output.adjustedUnitCostUsd).toBe(211);
    expect(output.bcvPriceUsd).toBe(341);
    expect(output.salePriceBs).toBe(289700);
    expect(output.grossMarginBs).toBe(110443);
    expect(output.promoPriceUsd).toBe(299);
    expect(output.promoPriceUsd2).toBe(282);
  });

  it("matches Excel row for Nevera No Frost 12 Pies (28% margin)", () => {
    const output = calculateProductPricing(
      { supplierCostUsd: 380, targetMarginPercentage: 0.28 },
      rates
    );

    expect(output.adjustedUnitCostUsd).toBe(333);
    expect(output.bcvPriceUsd).toBe(463);
    expect(output.salePriceBs).toBe(393347);
    expect(output.grossMarginBs).toBe(110444);
    expect(output.promoPriceUsd).toBe(406);
    expect(output.promoPriceUsd2).toBe(382);
  });

  it("matches Excel row for Lavadora Automática 14 Kg (28% margin)", () => {
    const output = calculateProductPricing(
      { supplierCostUsd: 320, targetMarginPercentage: 0.28 },
      rates
    );

    expect(output.adjustedUnitCostUsd).toBe(281);
    expect(output.bcvPriceUsd).toBe(391);
    expect(output.salePriceBs).toBe(332178);
    expect(output.grossMarginBs).toBe(93452);
    expect(output.promoPriceUsd).toBe(343);
    expect(output.promoPriceUsd2).toBe(323);
  });

  it("calculates break-even accurately for operational fixed costs", () => {
    const fixedCosts = [
      { concept: "Alquiler de Local Comercial", monthlyAmountUsd: 450 },
      { concept: "Sueldos y Salarios del Personal", monthlyAmountUsd: 700 },
      { concept: "Electricidad Comercial (Corpoelec)", monthlyAmountUsd: 65 },
      { concept: "Internet Fibra Óptica y Telefonía", monthlyAmountUsd: 45 },
      { concept: "Servicio de Agua y Aseo Urbano", monthlyAmountUsd: 35 },
      { concept: "Impuestos Municipales y Patente", monthlyAmountUsd: 90 },
      { concept: "Software de Punto de Venta e Impresora Fiscal", monthlyAmountUsd: 30 },
      { concept: "Servicios Contables y Asesoría", monthlyAmountUsd: 80 },
      { concept: "Mantenimiento y Seguridad Local", monthlyAmountUsd: 50 },
      { concept: "Caja Chica e Imprevistos Mensuales", monthlyAmountUsd: 55 },
    ];

    const result = calculateBreakEven(fixedCosts, 0.04577319588, 849.56);
    expect(result.totalFixedCostsUsd).toBe(1600);
    expect(result.breakEvenMonthlyUsd).toBeCloseTo(34954.95, 1);
    expect(result.dailyTargetMinUsd).toBeCloseTo(1165.17, 1);
  });
});
