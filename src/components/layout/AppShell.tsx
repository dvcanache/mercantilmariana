"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WindowTitleBar } from "./WindowTitleBar";
import { AppRibbon } from "./AppRibbon";
import { AppStatusBar } from "./AppStatusBar";
import { RateUpdateModal } from "@/components/pricing/RateUpdateModal";
import { SalesFormModal } from "@/components/sales/SalesFormModal";
import { ProductFormModal } from "@/components/pricing/ProductFormModal";
import { ExchangeRates } from "@/lib/pricing-engine";
import { ProductItem } from "@/components/pricing/PriceControlTable";
import { ProductFormData } from "@/lib/types/product";
import defaultSeedData from "@/data/seed-data.json";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const [rates, setRates] = useState<ExchangeRates>(defaultSeedData.rates);
  const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>(defaultSeedData.products as any);
  const [user, setUser] = useState({
    id: "usr_admin",
    name: "Administrador General",
    email: "admin@mercantilmariana.com",
    role: "ADMIN",
  });
  const [loadingUser, setLoadingUser] = useState(true);

  // Load user session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoadingUser(false);
      }
    }
    checkAuth();
  }, [router]);

  // Load rates and products on mount
  useEffect(() => {
    async function loadData() {
      try {
        const resRates = await fetch("/api/rates");
        if (resRates.ok) {
          const data = await resRates.json();
          if (data.rates) setRates(data.rates);
        }
      } catch {
        // Fallback to seed data
      }

      try {
        const resProds = await fetch("/api/products");
        if (resProds.ok) {
          const prods = await resProds.json();
          if (Array.isArray(prods) && prods.length > 0) setProducts(prods);
        }
      } catch {
        // Fallback to seed data
      }
    }
    loadData();
  }, []);

  const handleSaveRates = async (newRates: ExchangeRates) => {
    try {
      const res = await fetch("/api/rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRates),
      });
      if (res.ok) {
        setRates(newRates);
      } else {
        setRates(newRates);
      }
    } catch {
      setRates(newRates);
    }
  };

  const handleSyncBcv = async (): Promise<number> => {
    const res = await fetch("/api/rates/sync", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      return data.officialBcvRate;
    }
    throw new Error("No se pudo sincronizar");
  };

  const handleNewSale = async (saleData: any) => {
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saleData),
    });
    window.location.reload();
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "No se pudo registrar el producto");
    }
    // Refresh products in memory
    const resProds = await fetch("/api/products");
    if (resProds.ok) {
      const p = await resProds.json();
      setProducts(p);
    }
    router.refresh();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Proceed with client logout
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center text-xs text-gray-500 font-sans">
        Cargando sesión del sistema...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col pb-8">
      {/* Windows 10 Title Bar */}
      <WindowTitleBar
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
      />

      {/* Windows 10 Ribbon Toolbar */}
      <AppRibbon
        userRole={user.role}
        onOpenRatesModal={() => setIsRatesModalOpen(true)}
        onOpenNewSaleModal={() => setIsSaleModalOpen(true)}
        onOpenNewProductModal={() => setIsProductModalOpen(true)}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-2 sm:p-3 overflow-auto max-w-[1700px] w-full mx-auto pb-10">
        {children}
      </main>

      {/* Status Bar */}
      <AppStatusBar
        officialBcvRate={rates.officialBcvRate}
        supplierReplacementRate={rates.supplierReplacementRate}
        promoDiscountPercentage={rates.promoDiscountPercentage}
      />

      {/* Modals - restricted to users with rate or sale permission */}
      {user.role !== "SALES_CLERK" && (
        <>
          <RateUpdateModal
            isOpen={isRatesModalOpen}
            onClose={() => setIsRatesModalOpen(false)}
            currentBcv={rates.officialBcvRate}
            currentReplacement={rates.supplierReplacementRate}
            currentDiscount={rates.promoDiscountPercentage}
            onSaveRates={handleSaveRates}
            onSyncBcv={handleSyncBcv}
          />

          <SalesFormModal
            isOpen={isSaleModalOpen}
            onClose={() => setIsSaleModalOpen(false)}
            products={products}
            rates={rates}
            onSubmitSale={handleNewSale}
          />

          <ProductFormModal
            isOpen={isProductModalOpen}
            mode="create"
            existingCategories={Array.from(
              new Set(
                products.map((p) =>
                  typeof p.category === "string" ? p.category : p.category?.name || "General"
                )
              )
            )}
            exchangeRates={rates}
            onClose={() => setIsProductModalOpen(false)}
            onSave={handleSaveProduct}
          />
        </>
      )}
    </div>
  );
};
