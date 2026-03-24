import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = url && key ? createClient(url, key) : null;

const toSnake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const mapKeys = (obj, fn) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((o) => mapKeys(o, fn));
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [fn(k), v]));
};

const LOCAL_KEY = 'vforge_cashflow_data';

const getLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
};

const setLocal = (data) => localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

export const db = {
  async fetchAll(table) {
    if (supabase) {
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true });
      if (error) throw error;
      return (data || []).map((r) => mapKeys(r, toCamel));
    }
    const local = getLocal();
    return local[table] || [];
  },

  async insert(table, row) {
    const snakeRow = mapKeys(row, toSnake);
    if (supabase) {
      const { data, error } = await supabase.from(table).insert(snakeRow).select().single();
      if (error) throw error;
      return mapKeys(data, toCamel);
    }
    const local = getLocal();
    if (!local[table]) local[table] = [];
    const newRow = { ...row, id: Date.now() };
    local[table].push(newRow);
    setLocal(local);
    return newRow;
  },

  async update(table, id, updates) {
    const snakeUpdates = mapKeys(updates, toSnake);
    if (supabase) {
      const { data, error } = await supabase.from(table).update(snakeUpdates).eq('id', id).select().single();
      if (error) throw error;
      return mapKeys(data, toCamel);
    }
    const local = getLocal();
    if (!local[table]) return null;
    const idx = local[table].findIndex((r) => r.id === id);
    if (idx >= 0) {
      local[table][idx] = { ...local[table][idx], ...updates };
      setLocal(local);
      return local[table][idx];
    }
    return null;
  },

  async remove(table, id) {
    if (supabase) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    const local = getLocal();
    if (!local[table]) return false;
    local[table] = local[table].filter((r) => r.id !== id);
    setLocal(local);
    return true;
  },

  async upsert(table, row, conflictKeys = ['id']) {
    const snakeRow = mapKeys(row, toSnake);
    if (supabase) {
      const { data, error } = await supabase
        .from(table)
        .upsert(snakeRow, { onConflict: conflictKeys.map(toSnake).join(',') })
        .select()
        .single();
      if (error) throw error;
      return mapKeys(data, toCamel);
    }
    const local = getLocal();
    if (!local[table]) local[table] = [];
    const idx = local[table].findIndex((r) =>
      conflictKeys.every((k) => r[k] === row[k])
    );
    if (idx >= 0) {
      local[table][idx] = { ...local[table][idx], ...row };
    } else {
      local[table].push({ ...row, id: row.id || Date.now() });
    }
    setLocal(local);
    return local[table][idx >= 0 ? idx : local[table].length - 1];
  },
};
