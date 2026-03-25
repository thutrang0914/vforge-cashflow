export const DEFAULT_VARIABLES = {
  // Revenue drivers - Học phí
  studentCount: 50,
  avgTuitionPerStudent: 3_000_000,
  tuitionGrowthPct: 2,

  // Revenue drivers - Robot
  robotsSoldPerMonth: 10,
  avgRobotPrice: 5_000_000,
  robotSalesGrowthPct: 3,

  // Revenue drivers - Subscription
  subscriberCount: 100,
  subscriptionFeePerMonth: 200_000,
  subscriptionGrowthPct: 5,
  churnRatePct: 3,

  // Revenue drivers - Staffing
  staffingHeadcount: 8,
  staffingRatePerPerson: 15_000_000,
  staffingGrowthPct: 1,

  // Fixed costs
  employeeCount: 15,
  avgSalary: 12_000_000,
  rentCost: 30_000_000,
  softwareCost: 5_000_000,

  // Variable costs
  teacherCount: 5,
  avgTeacherSalary: 10_000_000,
  materialPctOfRobotSales: 40,
  marketingMode: 'fixed',
  marketingFixed: 10_000_000,
  marketingPctOfRevenue: 5,
  operationsCost: 8_000_000,
  taxPctOfProfit: 20,
  variableCostGrowthPct: 2,

  // Initial capital & fixed assets
  initialCapital: 500_000_000,
  fixedAssetInvestment: 300_000_000,
  fixedAssetDepreciationYears: 5,

  // Other
  costInflationPct: 0.5,
};

const OPTIMISTIC_ADJUSTMENTS = {
  tuitionGrowthPct: 4,
  robotSalesGrowthPct: 5,
  subscriptionGrowthPct: 8,
  churnRatePct: 1.5,
  staffingGrowthPct: 3,
  studentCount: 60,
  robotsSoldPerMonth: 15,
  subscriberCount: 120,
  variableCostGrowthPct: 1,
  costInflationPct: 0.3,
};

const PESSIMISTIC_ADJUSTMENTS = {
  tuitionGrowthPct: 0,
  robotSalesGrowthPct: 0,
  subscriptionGrowthPct: 1,
  churnRatePct: 6,
  staffingGrowthPct: 0,
  studentCount: 35,
  robotsSoldPerMonth: 5,
  subscriberCount: 70,
  variableCostGrowthPct: 4,
  costInflationPct: 1,
};

export function getScenarioDefaults(scenarioName) {
  switch (scenarioName) {
    case 'optimistic':
      return { ...DEFAULT_VARIABLES, ...OPTIMISTIC_ADJUSTMENTS };
    case 'pessimistic':
      return { ...DEFAULT_VARIABLES, ...PESSIMISTIC_ADJUSTMENTS };
    default:
      return { ...DEFAULT_VARIABLES };
  }
}

export const VARIABLE_GROUPS = [
  {
    key: 'initialInvestment',
    title: 'Vốn & Đầu tư ban đầu',
    icon: '🏗️',
    fields: [
      { key: 'initialCapital', label: 'Tổng vốn góp ban đầu', unit: 'đ', step: 10_000_000 },
      { key: 'fixedAssetInvestment', label: 'Đầu tư TSCĐ ban đầu', unit: 'đ', step: 10_000_000 },
      { key: 'fixedAssetDepreciationYears', label: 'Khấu hao TSCĐ', unit: 'năm', step: 1 },
    ],
  },
  {
    key: 'revenue',
    title: 'Thu nhập',
    icon: '📈',
    fields: [
      { key: 'studentCount', label: 'Số học viên', unit: 'người', step: 1 },
      { key: 'avgTuitionPerStudent', label: 'Học phí TB/học viên', unit: 'đ/tháng', step: 100000 },
      { key: 'tuitionGrowthPct', label: 'Tăng trưởng học phí', unit: '%/tháng', step: 0.5 },
      { key: 'robotsSoldPerMonth', label: 'Robot bán/tháng', unit: 'cái', step: 1 },
      { key: 'avgRobotPrice', label: 'Giá bán TB', unit: 'đ', step: 100000 },
      { key: 'robotSalesGrowthPct', label: 'Tăng trưởng robot', unit: '%/tháng', step: 0.5 },
      { key: 'subscriberCount', label: 'Số subscriber', unit: 'người', step: 1 },
      { key: 'subscriptionFeePerMonth', label: 'Phí subscription', unit: 'đ/tháng', step: 10000 },
      { key: 'subscriptionGrowthPct', label: 'Tăng trưởng sub', unit: '%/tháng', step: 0.5 },
      { key: 'churnRatePct', label: 'Tỷ lệ churn', unit: '%/tháng', step: 0.5 },
      { key: 'staffingHeadcount', label: 'Nhân sự cung cấp', unit: 'người', step: 1 },
      { key: 'staffingRatePerPerson', label: 'Rate/người/tháng', unit: 'đ', step: 500000 },
      { key: 'staffingGrowthPct', label: 'Tăng trưởng staffing', unit: '%/tháng', step: 0.5 },
    ],
  },
  {
    key: 'fixedCosts',
    title: 'Chi phí cố định',
    icon: '🏢',
    fields: [
      { key: 'employeeCount', label: 'Số nhân viên', unit: 'người', step: 1 },
      { key: 'avgSalary', label: 'Lương TB/người', unit: 'đ/tháng', step: 500000 },
      { key: 'rentCost', label: 'Mặt bằng', unit: 'đ/tháng', step: 500000 },
      { key: 'softwareCost', label: 'Phần mềm', unit: 'đ/tháng', step: 100000 },
    ],
  },
  {
    key: 'variableCosts',
    title: 'Chi phí biến đổi',
    icon: '📊',
    fields: [
      { key: 'teacherCount', label: 'Số giáo viên', unit: 'người', step: 1 },
      { key: 'avgTeacherSalary', label: 'Lương TB/giáo viên', unit: 'đ/tháng', step: 500000 },
      { key: 'materialPctOfRobotSales', label: 'NVL (% DT robot)', unit: '%', step: 1 },
      { key: 'marketingMode', label: 'Marketing mode', unit: '', type: 'select',
        options: [{ value: 'fixed', label: 'Cố định' }, { value: 'pct', label: '% doanh thu' }] },
      { key: 'marketingFixed', label: 'Marketing (cố định)', unit: 'đ/tháng', step: 500000,
        showWhen: (v) => v.marketingMode === 'fixed' },
      { key: 'marketingPctOfRevenue', label: 'Marketing (% DT)', unit: '%', step: 0.5,
        showWhen: (v) => v.marketingMode === 'pct' },
      { key: 'operationsCost', label: 'Vận hành', unit: 'đ/tháng', step: 500000 },
      { key: 'taxPctOfProfit', label: 'Thuế (% lợi nhuận)', unit: '%', step: 1 },
      { key: 'variableCostGrowthPct', label: 'Tăng trưởng CP biến đổi', unit: '%/tháng', step: 0.5 },
    ],
  },
  {
    key: 'other',
    title: 'Khác',
    icon: '⚙️',
    fields: [
      { key: 'costInflationPct', label: 'Lạm phát chi phí', unit: '%/tháng', step: 0.1 },
    ],
  },
];
