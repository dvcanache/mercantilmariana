"use client";

import React, { useEffect, useState } from "react";
import { KpiCardsGrid } from "@/components/dashboard/KpiCardsGrid";
import { ConsolidatedMonthTable } from "@/components/dashboard/ConsolidatedMonthTable";
import { computeDashboardMetrics } from "@/lib/dashboard-service";
import defaultSeedData from "@/data/seed-data.json";

export default function ResumenGananciasPage() {
  const [data, setData] = useState(() =>
    computeDashboardMetrics(defaultSeedData.sales, 1600, new Date(2026, 8, 21))
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (res.ok) {
          const json = await res.json();
          if (json.consolidated12Months) setData(json);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="bg-white border border-win10-border p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <h1 className="text-sm font-bold uppercase text-excel-darkGreen">
            DASHBOARD FINANCIERO: RESUMEN EJECUTIVO DE GANANCIAS
          </h1>
          <p className="text-xs text-gray-500">
            Consolidado de rentabilidad diaria, semanal, mensual y anual frente a costos fijos ($1,600.00/mes).
          </p>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <KpiCardsGrid
        dailyProfit={data.dailyProfitUsd}
        weeklyProfit={data.weeklyProfitUsd}
        monthlyProfit={data.monthlyProfitUsd}
        annualProfit={data.annualProfitUsd}
        fixedCostsMonthly={data.monthlyFixedCostsUsd}
        netIncomeMonthly={data.monthlyNetIncomeUsd}
      />

      {/* 12-Month Consolidated Table */}
      <ConsolidatedMonthTable months={data.consolidated12Months} />
    </div>
  );
}
