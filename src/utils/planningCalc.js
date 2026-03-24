export function computeProjection(vars, startMonth) {
  const rows = [];
  let cumulative = 0;
  let breakEvenMonth = -1;

  const [startY, startM] = startMonth.split('-').map(Number);

  for (let m = 0; m < 12; m++) {
    const dt = new Date(startY, startM - 1 + m + 1, 1);
    const monthLabel = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;

    const grow = (base, pct) => base * Math.pow(1 + pct / 100, m);

    // Revenue
    const tuitionRevenue = Math.round(
      grow(vars.studentCount, vars.tuitionGrowthPct) * vars.avgTuitionPerStudent
    );

    const robotRevenue = Math.round(
      grow(vars.robotsSoldPerMonth, vars.robotSalesGrowthPct) * vars.avgRobotPrice
    );

    const netSubGrowth = vars.subscriptionGrowthPct - vars.churnRatePct;
    const activeSubscribers = Math.max(0, Math.round(
      vars.subscriberCount * Math.pow(1 + netSubGrowth / 100, m)
    ));
    const subscriptionRevenue = activeSubscribers * vars.subscriptionFeePerMonth;

    const staffingRevenue = Math.round(
      grow(vars.staffingHeadcount, vars.staffingGrowthPct) * vars.staffingRatePerPerson
    );

    const totalRevenue = tuitionRevenue + robotRevenue + subscriptionRevenue + staffingRevenue;

    // Fixed costs (with inflation)
    const inflationFactor = Math.pow(1 + vars.costInflationPct / 100, m);
    const salaryCost = Math.round(vars.employeeCount * vars.avgSalary * inflationFactor);
    const rentCost = Math.round(vars.rentCost * inflationFactor);
    const softwareCost = Math.round(vars.softwareCost * inflationFactor);

    // Variable costs
    const materialCost = Math.round(robotRevenue * vars.materialPctOfRobotSales / 100);

    const varGrowFactor = Math.pow(1 + vars.variableCostGrowthPct / 100, m);
    let marketingCost;
    if (vars.marketingMode === 'pct') {
      marketingCost = Math.round(totalRevenue * vars.marketingPctOfRevenue / 100);
    } else {
      marketingCost = Math.round(vars.marketingFixed * varGrowFactor);
    }

    const operationsCost = Math.round(vars.operationsCost * varGrowFactor);

    const expenseBeforeTax = salaryCost + rentCost + softwareCost + materialCost + marketingCost + operationsCost;
    const profitBeforeTax = totalRevenue - expenseBeforeTax;
    const taxCost = Math.round(Math.max(0, profitBeforeTax) * vars.taxPctOfProfit / 100);

    const totalExpense = expenseBeforeTax + taxCost;
    const netCashflow = totalRevenue - totalExpense;
    cumulative += netCashflow;

    if (breakEvenMonth < 0 && cumulative >= 0 && m > 0) {
      breakEvenMonth = m;
    }

    rows.push({
      month: monthLabel,
      monthIndex: m,

      // Revenue breakdown
      tuitionRevenue,
      robotRevenue,
      subscriptionRevenue,
      staffingRevenue,
      totalRevenue,

      // Expense breakdown
      salaryCost,
      rentCost,
      softwareCost,
      materialCost,
      marketingCost,
      operationsCost,
      taxCost,
      totalExpense,

      // Derived
      netCashflow,
      cumulativeCashflow: cumulative,
      activeSubscribers,
    });
  }

  // Summary
  const totalRevenue12 = rows.reduce((s, r) => s + r.totalRevenue, 0);
  const totalExpense12 = rows.reduce((s, r) => s + r.totalExpense, 0);
  const netProfit12 = totalRevenue12 - totalExpense12;
  const avgMonthlyProfit = Math.round(netProfit12 / 12);

  return {
    rows,
    summary: {
      totalRevenue12,
      totalExpense12,
      netProfit12,
      avgMonthlyProfit,
      breakEvenMonth,
      finalCumulative: cumulative,
    },
  };
}
