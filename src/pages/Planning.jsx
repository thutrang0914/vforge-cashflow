import { useState, useMemo, useCallback } from 'react';
import T from '../theme';
import { fmtShort, fmtMonth, getCurrentMonth } from '../utils';
import { getScenarioDefaults } from '../data/planningDefaults';
import { computeProjection } from '../utils/planningCalc';
import Stat from '../components/ui/Stat';
import ScenarioBar from '../components/planning/ScenarioBar';
import VariablePanel from '../components/planning/VariablePanel';
import ProjectionTable from '../components/planning/ProjectionTable';
import CashflowChart from '../components/planning/CashflowChart';

export default function Planning({ assumptions, onSaveAssumption }) {
  const [activeScenario, setActiveScenario] = useState('base');
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved or default variables
  const [variables, setVariables] = useState(() => {
    const saved = assumptions.find((a) => a.scenarioName === 'base');
    if (saved) {
      const { id, scenarioName, createdAt, updatedAt, ...vars } = saved;
      return { ...getScenarioDefaults('base'), ...vars };
    }
    return getScenarioDefaults('base');
  });

  const handleScenarioChange = useCallback((scenario) => {
    setActiveScenario(scenario);
    const saved = assumptions.find((a) => a.scenarioName === scenario);
    if (saved) {
      const { id, scenarioName, createdAt, updatedAt, ...vars } = saved;
      setVariables({ ...getScenarioDefaults(scenario), ...vars });
    } else {
      setVariables(getScenarioDefaults(scenario));
    }
    setHasChanges(false);
  }, [assumptions]);

  const handleVariableChange = useCallback((key, value) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSaveAssumption({
      scenarioName: activeScenario,
      ...variables,
    });
    setHasChanges(false);
  }, [activeScenario, variables, onSaveAssumption]);

  const handleReset = useCallback(() => {
    setVariables(getScenarioDefaults(activeScenario));
    setHasChanges(true);
  }, [activeScenario]);

  const startMonth = getCurrentMonth();

  const projection = useMemo(
    () => computeProjection(variables, startMonth),
    [variables, startMonth]
  );

  const { rows, summary } = projection;

  return (
    <div>
      <h2 style={{ margin: '0 0 12px', color: T.text, fontSize: 20 }}>
        Kế hoạch Tài chính & Dự báo Cashflow
      </h2>

      <ScenarioBar
        active={activeScenario}
        onChange={handleScenarioChange}
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
      />

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Left: Variable Panel */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <VariablePanel
            variables={variables}
            onChange={handleVariableChange}
          />
        </div>

        {/* Right: Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Initial Capital Stats */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12,
            padding: '12px 16px', borderRadius: T.radius,
            background: T.primaryLight, border: `1px solid ${T.primary}30`,
          }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: T.textMuted }}>Vốn góp ban đầu</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>{fmtShort(summary.initialCapital)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: T.textMuted }}>Đầu tư TSCĐ</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.orange }}>{fmtShort(summary.fixedAssetInvestment)}</div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: T.textMuted }}>Tiền mặt còn lại</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: summary.netInitialCash >= 0 ? T.green : T.red }}>
                {fmtShort(summary.netInitialCash)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: T.textMuted }}>Khấu hao/tháng</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textSecondary }}>{fmtShort(summary.monthlyDepreciation)}</div>
            </div>
          </div>

          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            <Stat
              label="Tổng thu nhập (12T)"
              value={fmtShort(summary.totalRevenue12)}
              color={T.green}
              icon="📈"
            />
            <Stat
              label="Tổng chi phí (12T)"
              value={fmtShort(summary.totalExpense12)}
              color={T.red}
              icon="📉"
            />
            <Stat
              label="Lợi nhuận ròng (12T)"
              value={fmtShort(summary.netProfit12)}
              color={summary.netProfit12 >= 0 ? T.green : T.red}
              icon="💰"
              sub={`TB: ${fmtShort(summary.avgMonthlyProfit)}/tháng`}
            />
            <Stat
              label="Break-even"
              value={
                summary.breakEvenMonth >= 0
                  ? fmtMonth(rows[summary.breakEvenMonth].month)
                  : rows[0]?.cumulativeCashflow >= 0 ? 'Ngay T1' : 'Chưa đạt'
              }
              color={summary.breakEvenMonth >= 0 || rows[0]?.cumulativeCashflow >= 0 ? T.green : T.orange}
              icon="🎯"
              sub={`Lũy kế cuối kỳ: ${fmtShort(summary.finalCumulative)}`}
            />
          </div>

          {/* Cashflow Chart */}
          <div style={{ marginBottom: 16 }}>
            <CashflowChart rows={rows} breakEvenMonth={summary.breakEvenMonth} />
          </div>

          {/* Projection Table */}
          <ProjectionTable rows={rows} breakEvenMonth={summary.breakEvenMonth} />
        </div>
      </div>
    </div>
  );
}
