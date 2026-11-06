"use client";

import React from "react";
import { Target, TrendingUp, Calendar, DollarSign, Award } from "lucide-react";

interface BreakEvenCardProps {
  totalFixedCostsUsd: number;
  averageMargin: number;
  bcvRate: number;
}

export const BreakEvenCard: React.FC<BreakEvenCardProps> = ({
  totalFixedCostsUsd,
  averageMargin,
  bcvRate,
}) => {
  const margin = averageMargin > 0 ? averageMargin : 0.045773;
  const breakEvenMonthlyUsd = totalFixedCostsUsd / margin;
  const breakEvenMonthlyBs = breakEvenMonthlyUsd * bcvRate;
  const dailyTargetMinUsd = breakEvenMonthlyUsd / 30;
  const dailyTargetMinBs = breakEvenMonthlyBs / 30;

  return (
    <div className="bg-white border border-win10-border shadow-sm flex flex-col h-full">
      {/* Title */}
      <div className="p-3 bg-excel-darkGreen text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wide">
            Metas para el Punto de Equilibrio (Break-Even)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-200">
          Margen Promedio: {(margin * 100).toFixed(2)}%
        </span>
      </div>

      {/* Content Cards */}
      <div className="p-4 space-y-4 flex-1">
        {/* Monthly Target Box */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-excel-mediumGreen/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-excel-darkGreen mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>VENTAS DE EQUILIBRIO AL MES (OBJETIVO MENSUAL)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-excel-darkGreen mt-2">
            $ {Math.round(breakEvenMonthlyUsd).toLocaleString()}{" "}
            <span className="text-sm font-normal text-gray-600">USD</span>
          </div>
          <div className="text-sm font-mono text-gray-700 mt-1">
            {Math.round(breakEvenMonthlyBs).toLocaleString("es-VE")} Bs. (Tasa BCV)
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Volumen de facturación mensual indispensable para cubrir el 100% de los costos fijos operacionales ($ {totalFixedCostsUsd.toLocaleString()}) sin pérdidas.
          </p>
        </div>

        {/* Daily Target Box */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
            <Calendar className="w-4 h-4" />
            <span>META DE VENTA DIARIA MÍNIMA (OBJETIVO DIARIO)</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 mt-2">
            $ {Math.round(dailyTargetMinUsd).toLocaleString()}{" "}
            <span className="text-sm font-normal text-gray-600">USD / día</span>
          </div>
          <div className="text-xs font-mono text-gray-700 mt-1">
            {Math.round(dailyTargetMinBs).toLocaleString("es-VE")} Bs. / día
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Facturación mínima que debe alcanzar la tienda diariamente (base 30 días) para estar en balance financiero.
          </p>
        </div>

        {/* Sensitivity Info */}
        <div className="bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800">
            <Award className="w-3.5 h-3.5 text-excel-mediumGreen" />
            <span>Regla de Protección de Margen:</span>
          </div>
          <p className="text-[11px]">
            A mayor margen de contribución promedio de los productos vendidos, menor es la meta de facturación necesaria para alcanzar el punto de equilibrio.
          </p>
        </div>
      </div>
    </div>
  );
};
