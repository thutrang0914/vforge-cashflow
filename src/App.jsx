import { useState, useEffect, useCallback, useMemo } from 'react';
import T from './theme';
import { db } from './supabase';
import { generateSeedData } from './data/seed';
import { DEFAULT_ALL_CATEGORIES } from './utils';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Forecast from './pages/Forecast';
import Planning from './pages/Planning';
import Categories from './pages/Categories';

const DEFAULT_CAT_IDS = DEFAULT_ALL_CATEGORIES.map((c) => c.id);

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem('vf_page') || 'dashboard');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [planningAssumptions, setPlanningAssumptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Merge default + custom categories
  const allCategories = useMemo(() => {
    const merged = [...DEFAULT_ALL_CATEGORIES];
    customCategories.forEach((cc) => {
      const idx = merged.findIndex((m) => m.id === cc.id);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...cc };
      } else {
        merged.push(cc);
      }
    });
    return merged;
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem('vf_page', page);
  }, [page]);

  useEffect(() => {
    (async () => {
      try {
        let txs = await db.fetchAll('transactions');
        let bds = await db.fetchAll('budgets');

        if (!txs.length) {
          const seed = generateSeedData();
          txs = seed.transactions;
          bds = seed.budgets;
          for (const t of txs) await db.insert('transactions', t);
          for (const b of bds) await db.insert('budgets', b);
          txs = await db.fetchAll('transactions');
          bds = await db.fetchAll('budgets');
        }

        let plans = [];
        try { plans = await db.fetchAll('planning_assumptions'); } catch {}
        let cats = [];
        try { cats = await db.fetchAll('custom_categories'); } catch {}

        setTransactions(txs);
        setBudgets(bds);
        setPlanningAssumptions(plans);
        setCustomCategories(cats);
      } catch (err) {
        console.error('Load error:', err);
        const seed = generateSeedData();
        setTransactions(seed.transactions);
        setBudgets(seed.budgets);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddTransaction = useCallback(async (tx) => {
    try {
      const saved = await db.insert('transactions', tx);
      setTransactions((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Add error:', err);
    }
  }, []);

  const handleUpdateTransaction = useCallback(async (tx) => {
    try {
      const { id, ...updates } = tx;
      const saved = await db.update('transactions', id, updates);
      if (saved) setTransactions((prev) => prev.map((t) => (t.id === id ? saved : t)));
    } catch (err) {
      console.error('Update error:', err);
    }
  }, []);

  const handleDeleteTransaction = useCallback(async (id) => {
    try {
      await db.remove('transactions', id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, []);

  const handleUpdateBudget = useCallback(async (month, categoryId, plannedAmount) => {
    try {
      const existing = budgets.find((b) => b.month === month && b.categoryId === categoryId);
      if (existing) {
        const saved = await db.update('budgets', existing.id, { plannedAmount });
        if (saved) setBudgets((prev) => prev.map((b) => (b.id === existing.id ? saved : b)));
      } else {
        const saved = await db.insert('budgets', { month, categoryId, plannedAmount });
        setBudgets((prev) => [...prev, saved]);
      }
    } catch (err) {
      console.error('Budget error:', err);
    }
  }, [budgets]);

  const handleSavePlanningAssumption = useCallback(async (assumption) => {
    try {
      const existing = planningAssumptions.find((a) => a.scenarioName === assumption.scenarioName);
      if (existing) {
        const saved = await db.update('planning_assumptions', existing.id, assumption);
        if (saved) setPlanningAssumptions((prev) => prev.map((a) => (a.id === existing.id ? saved : a)));
      } else {
        const saved = await db.insert('planning_assumptions', assumption);
        setPlanningAssumptions((prev) => [...prev, saved]);
      }
    } catch (err) {
      console.error('Planning save error:', err);
    }
  }, [planningAssumptions]);

  // Category CRUD
  const handleAddCategory = useCallback(async (cat) => {
    try {
      const saved = await db.insert('custom_categories', cat);
      setCustomCategories((prev) => [...prev, saved]);
    } catch (err) {
      console.error('Add category error:', err);
    }
  }, []);

  const handleUpdateCategory = useCallback(async (cat) => {
    try {
      const existing = customCategories.find((c) => c.id === cat.id);
      if (existing) {
        const saved = await db.update('custom_categories', existing.id, cat);
        if (saved) setCustomCategories((prev) => prev.map((c) => (c.id === cat.id ? saved : c)));
      } else {
        // Updating a default category → save as custom override
        const saved = await db.insert('custom_categories', cat);
        setCustomCategories((prev) => [...prev, saved]);
      }
    } catch (err) {
      console.error('Update category error:', err);
    }
  }, [customCategories]);

  const handleDeleteCategory = useCallback(async (catId) => {
    try {
      const existing = customCategories.find((c) => c.id === catId);
      if (existing) {
        await db.remove('custom_categories', existing.id);
        setCustomCategories((prev) => prev.filter((c) => c.id !== catId));
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  }, [customCategories]);

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg, color: T.textSecondary, fontFamily: T.font,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} categories={allCategories} />;
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
            categories={allCategories}
            onAdd={handleAddTransaction}
            onUpdate={handleUpdateTransaction}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'budget':
        return (
          <Budget
            transactions={transactions}
            budgets={budgets}
            categories={allCategories}
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} categories={allCategories} />;
      case 'forecast':
        return <Forecast transactions={transactions} budgets={budgets} categories={allCategories} />;
      case 'planning':
        return (
          <Planning
            assumptions={planningAssumptions}
            onSaveAssumption={handleSavePlanningAssumption}
          />
        );
      case 'categories':
        return (
          <Categories
            categories={allCategories}
            defaultCategoryIds={DEFAULT_CAT_IDS}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        );
      default:
        return <Dashboard transactions={transactions} budgets={budgets} categories={allCategories} />;
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', background: T.bg, fontFamily: T.font,
      color: T.text, overflow: 'hidden',
    }}>
      <Sidebar active={page} onNavigate={setPage} />
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {renderPage()}
      </main>
    </div>
  );
}
