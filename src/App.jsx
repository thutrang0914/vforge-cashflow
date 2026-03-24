import { useState, useEffect, useCallback } from 'react';
import T from './theme';
import { db } from './supabase';
import { generateSeedData } from './data/seed';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Forecast from './pages/Forecast';

export default function App() {
  const [page, setPage] = useState(() => localStorage.getItem('vf_page') || 'dashboard');
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

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
          // Save seed to localStorage
          for (const t of txs) await db.insert('transactions', t);
          for (const b of bds) await db.insert('budgets', b);
          txs = await db.fetchAll('transactions');
          bds = await db.fetchAll('budgets');
        }

        setTransactions(txs);
        setBudgets(bds);
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
        return <Dashboard transactions={transactions} budgets={budgets} />;
      case 'transactions':
        return (
          <Transactions
            transactions={transactions}
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
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'reports':
        return <Reports transactions={transactions} />;
      case 'forecast':
        return <Forecast transactions={transactions} budgets={budgets} />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} />;
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
