export interface SaleItemForDashboard {
  date: Date | string;
  totalSaleUsd: number;
  totalMarginUsd: number;
}

export interface MonthSummary {
  monthIndex: number;
  monthName: string;
  salesUsd: number;
  grossProfitUsd: number;
  fixedCostsUsd: number;
  netIncomeUsd: number;
  netMarginPercent: number;
}

export interface DashboardMetrics {
  dailyProfitUsd: number;
  weeklyProfitUsd: number;
  monthlyProfitUsd: number;
  annualProfitUsd: number;
  monthlyFixedCostsUsd: number;
  monthlyNetIncomeUsd: number;
  consolidated12Months: MonthSummary[];
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function computeDashboardMetrics(
  sales: SaleItemForDashboard[],
  monthlyFixedCostsUsd: number = 1600,
  referenceDate: Date = new Date()
): DashboardMetrics {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth(); // 0-indexed
  const refDay = referenceDate.getDate();

  // Normalize reference date to start of day
  const todayStart = new Date(refYear, refMonth, refDay, 0, 0, 0, 0);
  const todayEnd = new Date(refYear, refMonth, refDay, 23, 59, 59, 999);

  // 7 days rolling
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Month bounds
  const monthStart = new Date(refYear, refMonth, 1, 0, 0, 0, 0);
  const monthEnd = new Date(refYear, refMonth + 1, 0, 23, 59, 59, 999);

  // Year bounds
  const yearStart = new Date(refYear, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(refYear, 11, 31, 23, 59, 59, 999);

  let dailyProfitUsd = 0;
  let weeklyProfitUsd = 0;
  let monthlyProfitUsd = 0;
  let annualProfitUsd = 0;

  // Monthly buckets for 12-month consolidated summary
  const monthlyBuckets = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    monthName: MONTH_NAMES[i],
    salesUsd: 0,
    grossProfitUsd: 0,
    fixedCostsUsd: monthlyFixedCostsUsd,
    netIncomeUsd: -monthlyFixedCostsUsd,
    netMarginPercent: 0,
  }));

  for (const sale of sales) {
    const saleDate = new Date(sale.date);
    const saleMargin = Number(sale.totalMarginUsd) || 0;
    const saleTotal = Number(sale.totalSaleUsd) || 0;

    // Daily
    if (saleDate >= todayStart && saleDate <= todayEnd) {
      dailyProfitUsd += saleMargin;
    }

    // Weekly (7 days rolling)
    if (saleDate >= sevenDaysAgo && saleDate <= todayEnd) {
      weeklyProfitUsd += saleMargin;
    }

    // Monthly
    if (saleDate >= monthStart && saleDate <= monthEnd) {
      monthlyProfitUsd += saleMargin;
    }

    // Annual
    if (saleDate >= yearStart && saleDate <= yearEnd) {
      annualProfitUsd += saleMargin;

      // Add to corresponding month bucket
      const mIdx = saleDate.getMonth();
      if (mIdx >= 0 && mIdx < 12) {
        monthlyBuckets[mIdx].salesUsd += saleTotal;
        monthlyBuckets[mIdx].grossProfitUsd += saleMargin;
      }
    }
  }

  // If there are no sales today, but sales exist in dataset, use latest sale day for daily KPI preview (as in Excel)
  if (dailyProfitUsd === 0 && sales.length > 0) {
    const sorted = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestDate = new Date(sorted[0].date);
    const lStart = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate(), 0, 0, 0);
    const lEnd = new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate(), 23, 59, 59);

    let latestDayMargin = 0;
    let latest7DayMargin = 0;
    const l7Start = new Date(lStart);
    l7Start.setDate(l7Start.getDate() - 6);

    for (const s of sales) {
      const d = new Date(s.date);
      const m = Number(s.totalMarginUsd) || 0;
      if (d >= lStart && d <= lEnd) latestDayMargin += m;
      if (d >= l7Start && d <= lEnd) latest7DayMargin += m;
    }
    dailyProfitUsd = latestDayMargin;
    if (weeklyProfitUsd === 0) weeklyProfitUsd = latest7DayMargin;
  }

  // Recalculate net incomes and margins for buckets
  for (const b of monthlyBuckets) {
    b.netIncomeUsd = b.grossProfitUsd - b.fixedCostsUsd;
    b.netMarginPercent = b.salesUsd > 0 ? b.netIncomeUsd / b.salesUsd : 0;
  }

  const monthlyNetIncomeUsd = monthlyProfitUsd - monthlyFixedCostsUsd;

  return {
    dailyProfitUsd: Math.round(dailyProfitUsd),
    weeklyProfitUsd: Math.round(weeklyProfitUsd),
    monthlyProfitUsd: Math.round(monthlyProfitUsd),
    annualProfitUsd: Math.round(annualProfitUsd),
    monthlyFixedCostsUsd,
    monthlyNetIncomeUsd: Math.round(monthlyNetIncomeUsd),
    consolidated12Months: monthlyBuckets,
  };
}
