"use client";

import React, { useEffect, useState } from "react";
import { FixedCostsTable, FixedCostItem } from "@/components/break-even/FixedCostsTable";
import { BreakEvenCard } from "@/components/break-even/BreakEvenCard";
import defaultSeedData from "@/data/seed-data.json";

export default function PuntoEquilibrioPage() {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>(
    defaultSeedData.fixedCosts.map((c, idx) => ({
      id: `cost_${idx + 1}`,
      concept: c.concept,
      monthlyAmountUsd: c.monthlyAmountUsd,
      active: c.active,
    }))
  );
  const [bcvRate, setBcvRate] = useState<number>(defaultSeedData.rates.officialBcvRate);
  const [averageMargin, setAverageMargin] = useState<number>(0.04577319588);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/break-even");
        if (res.ok) {
          const data = await res.json();
          if (data.fixedCosts) setFixedCosts(data.fixedCosts);
          if (data.bcvRate) setBcvRate(data.bcvRate);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  const totalFixedCostsUsd = fixedCosts.reduce(
    (acc, c) => acc + (c.active ? c.monthlyAmountUsd : 0),
    0
  );

  const handleUpdateCost = async (id: string, amount: number) => {
    setFixedCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, monthlyAmountUsd: amount } : c))
    );
    try {
      await fetch("/api/break-even", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, amount }),
      });
    } catch {}
  };

  const handleAddCost = async (concept: string, amount: number) => {
    const newItem = {
      id: `cost_${fixedCosts.length + 1}`,
      concept,
      monthlyAmountUsd: amount,
      active: true,
    };
    setFixedCosts((prev) => [...prev, newItem]);
    try {
      await fetch("/api/break-even", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, amount }),
      });
    } catch {}
  };

  const handleDeleteCost = async (id: string) => {
    setFixedCosts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white border border-win10-border p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <h1 className="text-sm font-bold uppercase text-excel-darkGreen">
            ANÁLISIS DE PUNTO DE EQUILIBRIO (BREAK-EVEN) — MERCANTIL MARIANA
          </h1>
          <p className="text-xs text-gray-500">
            Distribución de costos fijos mensuales y cálculo de metas mínimas de facturación diaria y mensual.
          </p>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <FixedCostsTable
            items={fixedCosts}
            bcvRate={bcvRate}
            onUpdateCost={handleUpdateCost}
            onAddCost={handleAddCost}
            onDeleteCost={handleDeleteCost}
          />
        </div>
        <div className="lg:col-span-5">
          <BreakEvenCard
            totalFixedCostsUsd={totalFixedCostsUsd}
            averageMargin={averageMargin}
            bcvRate={bcvRate}
          />
        </div>
      </div>
    </div>
  );
}
