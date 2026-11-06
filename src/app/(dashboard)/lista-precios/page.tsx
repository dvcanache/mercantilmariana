"use client";

import React, { useEffect, useState } from "react";
import { PublicPriceTable } from "@/components/catalog/PublicPriceTable";
import { ProductItem } from "@/components/pricing/PriceControlTable";
import { ExchangeRates } from "@/lib/pricing-engine";
import defaultSeedData from "@/data/seed-data.json";

export default function ListaPreciosPage() {
  const [products, setProducts] = useState<ProductItem[]>(() =>
    (defaultSeedData.products as any[]).map((p, idx) => ({
      ...p,
      id: `prod_${idx + 1}`,
    }))
  );
  const [rates, setRates] = useState<ExchangeRates>(defaultSeedData.rates);

  useEffect(() => {
    async function load() {
      try {
        const [resProds, resRates] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/rates"),
        ]);
        if (resProds.ok) {
          const p = await resProds.json();
          if (Array.isArray(p) && p.length > 0) setProducts(p);
        }
        if (resRates.ok) {
          const r = await resRates.json();
          if (r.rates) setRates(r.rates);
        }
      } catch {
        // Fallback
      }
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      <PublicPriceTable
        products={products}
        rates={rates}
        onPrint={handlePrint}
      />
    </div>
  );
}
