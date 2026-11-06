"use client";

import React, { useEffect, useState } from "react";
import { ArrowRightLeft, DollarSign, Database, CheckCircle2 } from "lucide-react";

interface AppStatusBarProps {
  supplierReplacementRate?: number;
  officialBcvRate?: number;
  promoDiscountPercentage?: number;
}

export const AppStatusBar: React.FC<AppStatusBarProps> = ({
  supplierReplacementRate = 970.0,
  officialBcvRate = 849.56,
  promoDiscountPercentage = 0.06,
}) => {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("es-VE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const factor =
    supplierReplacementRate > 0
      ? (officialBcvRate / supplierReplacementRate).toFixed(4)
      : "1.0000";

  return (
    <footer className="h-6 sm:h-6 bg-[#E5E5E5] text-[#333333] border-t border-win10-border flex items-center justify-between px-2 sm:px-3 text-[10px] sm:text-[11px] font-mono select-none fixed bottom-0 left-0 right-0 z-40 no-print">
      {/* Left: Active Financial Rates */}
      <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 font-semibold text-excel-darkGreen shrink-0">
          <DollarSign className="w-3 h-3 text-excel-mediumGreen" />
          <span>BCV: Bs. {officialBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-gray-700 shrink-0">
          <span>Reposición: Bs. {supplierReplacementRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="flex items-center gap-1 bg-excel-lightSage px-1.5 py-0.2 rounded text-excel-darkGreen font-bold border border-excel-mediumGreen/30 shrink-0">
          <ArrowRightLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>Factor: {factor}</span>
        </div>

        <div className="text-gray-600 hidden md:inline shrink-0">
          <span>Promo: {(promoDiscountPercentage * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Right: System & Clock */}
      <div className="flex items-center space-x-2 text-gray-600 shrink-0">
        <div className="hidden md:flex items-center gap-1">
          <Database className="w-3 h-3 text-excel-mediumGreen" />
          <span>Postgres</span>
        </div>

        <div className="flex items-center gap-1 text-excel-darkGreen">
          <CheckCircle2 className="w-3 h-3" />
          <span className="hidden sm:inline">Listo</span>
        </div>

        <div className="border-l border-gray-400 pl-1.5 font-mono text-gray-800 text-[10px]">
          {timeStr || "12:00:00"}
        </div>
      </div>
    </footer>
  );
};
