"use client";

import React, { useEffect, useState } from "react";
import { SalesHistoryTable, SaleTransactionItem } from "@/components/sales/SalesHistoryTable";
import defaultSeedData from "@/data/seed-data.json";

export default function RegistroVentasPage() {
  const [sales, setSales] = useState<SaleTransactionItem[]>(
    defaultSeedData.sales.map((s, idx) => ({
      id: `sale_${idx + 1}`,
      date: s.date,
      paymentMethod: s.paymentMethod,
      productName: s.productName,
      invoiceNumber: s.invoiceNumber,
      quantity: s.quantity,
      unitSalePriceUsd: s.unitSalePriceUsd,
      unitCostUsd: s.unitCostUsd,
      totalSaleUsd: s.totalSaleUsd,
      unitMarginUsd: s.unitMarginUsd,
      totalMarginUsd: s.totalMarginUsd,
    }))
  );

  useEffect(() => {
    async function loadSales() {
      try {
        const res = await fetch("/api/sales");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) setSales(data);
        }
      } catch {
        // Fallback
      }
    }
    loadSales();
  }, []);

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="bg-white border border-win10-border p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div>
          <h1 className="text-sm font-bold uppercase text-excel-darkGreen">
            MÓDULO DE REGISTRO DE VENTAS — MERCANTIL MARIANA
          </h1>
          <p className="text-xs text-gray-500">
            Registro cronológico de transacciones comerciales con cálculo automatizado de márgenes y utilidades en divisas.
          </p>
        </div>
      </div>

      <SalesHistoryTable sales={sales} />
    </div>
  );
}
