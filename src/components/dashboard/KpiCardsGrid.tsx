"use client";

import React from "react";
import { DollarSign, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface KpiCardsGridProps {
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  annualProfit: number;
  fixedCostsMonthly: number;
  netIncomeMonthly: number;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({
  dailyProfit,
  weeklyProfit,
  monthlyProfit,
  annualProfit,
  fixedCostsMonthly,
  netIncomeMonthly,
}) => {
  const isProfitable = netIncomeMonthly >= 0;

  const kpis = [
    {
      title: "GANANCIA DIARIA",
      subtitle: "Ventas de hoy",
      amount: dailyProfit,
      icon: Clock,
      color: "text-excel-darkGreen",
      bg: "bg-white",
      borderColor: "border-excel-mediumGreen",
    },
    {
      title: "GANANCIA SEMANAL",
      subtitle: "Últimos 7 días móviles",
      amount: weeklyProfit,
      icon: Calendar,
      color: "text-excel-darkGreen",
      bg: "bg-white",
      borderColor: "border-excel-mediumGreen",
    },
    {
      title: "GANANCIA MENSUAL",
      subtitle: "Mes en curso",
      amount: monthlyProfit,
      icon: TrendingUp,
      color: "text-excel-darkGreen",
      bg: "bg-white",
      borderColor: "border-excel-mediumGreen",
    },
    {
      title: "GANANCIA ANUAL",
      subtitle: "Acumulado del año",
      amount: annualProfit,
      icon: DollarSign,
      color: "text-excel-darkGreen",
      bg: "bg-white",
      borderColor: "border-excel-mediumGreen",
    },
    {
      title: "COSTOS FIJOS (MES)",
      subtitle: "Punto de Equilibrio",
      amount: fixedCostsMonthly,
      icon: AlertCircle,
      color: "text-gray-700",
      bg: "bg-gray-50",
      borderColor: "border-gray-300",
    },
    {
      title: "UTILIDAD NETA (MES)",
      subtitle: isProfitable ? "Superávit operativo" : "Déficit frente a costos",
      amount: netIncomeMonthly,
      icon: isProfitable ? CheckCircle : AlertCircle,
      color: isProfitable ? "text-emerald-700" : "text-red-700",
      bg: isProfitable ? "bg-emerald-50" : "bg-red-50",
      borderColor: isProfitable ? "border-emerald-500" : "border-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className={`${kpi.bg} border-2 ${kpi.borderColor} p-3 shadow-sm flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wide uppercase text-gray-500">
                  {kpi.title}
                </span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className={`text-xl font-bold font-mono mt-1 ${kpi.color}`}>
                $ {kpi.amount.toLocaleString()}
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-2 block border-t border-gray-200/60 pt-1">
              {kpi.subtitle}
            </span>
          </div>
        );
      })}
    </div>
  );
};
