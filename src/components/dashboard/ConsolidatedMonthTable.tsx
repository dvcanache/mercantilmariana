"use client";

import React from "react";
import { MonthSummary } from "@/lib/dashboard-service";

interface ConsolidatedMonthTableProps {
  months: MonthSummary[];
}

export const ConsolidatedMonthTable: React.FC<ConsolidatedMonthTableProps> = ({
  months,
}) => {
  const totalSales = months.reduce((acc, m) => acc + m.salesUsd, 0);
  const totalGross = months.reduce((acc, m) => acc + m.grossProfitUsd, 0);
  const totalFixed = months.reduce((acc, m) => acc + m.fixedCostsUsd, 0);
  const totalNet = totalGross - totalFixed;
  const avgMargin = totalSales > 0 ? (totalNet / totalSales) * 100 : 0;

  return (
    <div className="bg-white border border-win10-border shadow-sm flex flex-col">
      {/* Title */}
      <div className="p-3 bg-[#F9FAFB] border-b border-gray-200">
        <h3 className="text-xs font-bold text-excel-darkGreen uppercase">
          Estado Consolidado Mensual y Evaluación de Rentabilidad Neta
        </h3>
        <span className="text-[11px] text-gray-500">
          Proyección de utilidad neta descontando los costos fijos operacionales ($1,600.00/mes)
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-auto">
        <table className="win-table">
          <thead>
            <tr>
              <th className="charcoal">MES</th>
              <th className="numeric charcoal">VENTAS TOTALES ($)</th>
              <th className="numeric charcoal">UTILIDAD BRUTA ($)</th>
              <th className="numeric charcoal">COSTOS FIJOS ($)</th>
              <th className="numeric charcoal">UTILIDAD NETA ($)</th>
              <th className="numeric charcoal">MARGEN NETO %</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => {
              const isPositive = m.netIncomeUsd >= 0;
              const hasActivity = m.salesUsd > 0;

              return (
                <tr key={m.monthIndex} className={hasActivity ? "bg-excel-lightSage/20" : ""}>
                  <td className="font-semibold text-gray-800">{m.monthName}</td>
                  <td className="numeric font-mono">$ {m.salesUsd.toLocaleString()}</td>
                  <td className="numeric font-mono font-bold text-excel-darkGreen">
                    $ {m.grossProfitUsd.toLocaleString()}
                  </td>
                  <td className="numeric font-mono text-gray-500">
                    $ {m.fixedCostsUsd.toLocaleString()}
                  </td>
                  <td
                    className={`numeric font-mono font-bold ${
                      isPositive ? "text-emerald-700 bg-emerald-50/50" : "text-red-700 bg-red-50/30"
                    }`}
                  >
                    $ {m.netIncomeUsd.toLocaleString()}
                  </td>
                  <td
                    className={`numeric font-mono ${
                      isPositive ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {(m.netMarginPercent * 100).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-excel-lightSage font-bold text-xs">
              <td className="text-excel-darkGreen">ACUMULADO ANUAL TOTAL</td>
              <td className="numeric font-mono text-excel-darkGreen">
                $ {totalSales.toLocaleString()}
              </td>
              <td className="numeric font-mono text-excel-darkGreen">
                $ {totalGross.toLocaleString()}
              </td>
              <td className="numeric font-mono text-excel-darkGreen">
                $ {totalFixed.toLocaleString()}
              </td>
              <td
                className={`numeric font-mono ${
                  totalNet >= 0 ? "text-emerald-800" : "text-red-800"
                }`}
              >
                $ {totalNet.toLocaleString()}
              </td>
              <td className="numeric font-mono text-excel-darkGreen">
                {avgMargin.toFixed(1)}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
