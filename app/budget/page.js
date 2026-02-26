'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import AddTransactionModal from '@/components/AddTransactionModal';
import MonthNav from '@/components/MonthNav';
import { useTheme } from '@/hooks/useTheme';
import { CAT_COLORS, DEFAULT_CATEGORIES } from '@/lib/theme';
import { fmt, formatAmountDisplay, parseAmount } from '@/lib/utils';

function MiniBar({ value, max, color, T }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: T.surfaceAlt, borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: pct > 85 ? T.red : color, borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

// Generate a color for custom categories not in CAT_COLORS
const EXTRA_COLORS = ['#7C6AF0','#E8A838','#3BAB8C','#D46B9A','#4AABCD','#E8603C','#6BB56A'];
function getCatColor(cat, index) {
  return CAT_COLORS[cat] ?? EXTRA_COLORS[index % EXTRA_COLORS.length];
}

export default function BudgetPage() {
  const { T, mounted } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({});
  const [categories, setCategories] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  // Budget inline editing
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetEditVal, setBudgetEditVal] = useState('');
  // Add category
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = useCallback(async () => {
    const [txRes, budgetRes, catRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&year=${year}`),
      fetch(`/api/budget?month=${month}&year=${year}`),
      fetch('/api/categories'),
    ]);
    setTransactions(txRes.ok ? await txRes.json() : []);
    setBudget(budgetRes.ok ? await budgetRes.json() : {});
    setCategories(catRes.ok ? await catRes.json() : DEFAULT_CATEGORIES);
  }, [month, year]);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  const saveBudget = async (cat, val) => {
    const amt = parseAmount(val);
    await fetch('/api/budget', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, amount: amt, month, year }),
    });
    setBudget(prev => ({ ...prev, [cat]: amt }));
    setEditingBudget(null); setBudgetEditVal('');
  };

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    setAddingCat(true);
    const res = await fetch('/api/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(updated);
    }
    setNewCatName(''); setShowAddCat(false); setAddingCat(false);
  };

  const deleteCategory = async (cat) => {
    const res = await fetch(`/api/categories?name=${encodeURIComponent(cat)}`, { method: 'DELETE' });
    if (res.ok) {
      const updated = await res.json();
      setCategories(updated);
    }
    setConfirmDelete(null);
  };

  if (!mounted) return null;

  const catExpenses = {};
  categories.forEach((c, i) => {
    catExpenses[c] = transactions.filter(t => t.type === 'expense' && t.category === c).reduce((a, t) => a + Number(t.amount), 0);
  });
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0);

  const inpStyle = { background: T.surfaceAlt, border: `1px solid ${T.accent}`, color: T.text, borderRadius: 8, padding: '6px 10px', paddingLeft: 28, fontFamily: "'Space Mono', monospace", fontSize: 13, outline: 'none', width: 150 };

  return (
    <AppShell onAddClick={() => setShowAdd(true)}>
      <div className="fade-up">
        <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8 }}>BUDGET PER KATEGORI</div>
          <button onClick={() => setShowAddCat(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: T.accentSub, border: 'none', color: T.accent, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12 }}>
            <span style={{ fontSize: 15 }}>+</span> Tambah Kategori
          </button>
        </div>

        {/* Add category inline form */}
        {showAddCat && (
          <div className="slide-in" style={{ background: T.surface, border: `1px solid ${T.accent}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
              autoFocus
              placeholder="Nama kategori baru..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') { setShowAddCat(false); setNewCatName(''); } }}
              style={{ flex: 1, minWidth: 160, background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, padding: '9px 13px', fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
            />
            <button onClick={addCategory} disabled={addingCat || !newCatName.trim()}
              style={{ background: T.accent, border: 'none', color: '#fff', borderRadius: 9, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, opacity: (!newCatName.trim() || addingCat) ? 0.5 : 1 }}>
              Simpan
            </button>
            <button onClick={() => { setShowAddCat(false); setNewCatName(''); }}
              style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 9, padding: '9px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
              Batal
            </button>
          </div>
        )}

        {/* Category cards */}
        {categories.map((cat, i) => {
          const color = getCatColor(cat, i);
          const spent = catExpenses[cat] || 0;
          const budgetAmt = budget[cat] || 0;
          const pct = budgetAmt > 0 ? Math.min((spent / budgetAmt) * 100, 100) : 0;
          const over = budgetAmt > 0 && spent > budgetAmt;
          const notSet = budgetAmt === 0;
          const isDefault = DEFAULT_CATEGORIES.includes(cat);

          return (
            <div key={cat} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 9, padding: '15px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{cat}</span>
                  {!isDefault && (
                    <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: T.accentSub, color: T.accent, fontWeight: 700 }}>custom</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: notSet ? T.surfaceAlt : over ? T.redSub : T.greenSub, color: notSet ? T.textMuted : over ? T.red : T.green }}>
                    {notSet ? 'Belum diset' : over ? `+${fmt(spent - budgetAmt)}` : `Sisa ${fmt(budgetAmt - spent)}`}
                  </span>
                  {/* Delete button - only show for categories with 0 spending and not being edited */}
                  {editingBudget !== cat && (
                    <button onClick={() => setConfirmDelete(cat)}
                      style={{ background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, borderRadius: 6, width: 24, height: 24, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      title="Hapus kategori">
                      ×
                    </button>
                  )}
                </div>
              </div>

              <MiniBar value={spent} max={budgetAmt} color={color} T={T} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: T.textSub, fontWeight: 700 }}>{fmt(spent)}</span>
                {editingBudget === cat ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: T.textMuted, fontFamily: "'Space Mono', monospace", pointerEvents: 'none' }}>Rp</span>
                      <input autoFocus type="text" inputMode="numeric" placeholder="0" value={budgetEditVal}
                        onChange={e => setBudgetEditVal(formatAmountDisplay(e.target.value))}
                        onKeyDown={e => { if (e.key === 'Enter') saveBudget(cat, budgetEditVal); if (e.key === 'Escape') { setEditingBudget(null); setBudgetEditVal(''); } }}
                        style={inpStyle} />
                    </div>
                    <button onClick={() => saveBudget(cat, budgetEditVal)}
                      style={{ background: T.accent, border: 'none', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>Simpan</button>
                    <button onClick={() => { setEditingBudget(null); setBudgetEditVal(''); }}
                      style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Batal</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingBudget(cat); setBudgetEditVal(budgetAmt > 0 ? formatAmountDisplay(String(budgetAmt)) : ''); }}
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: notSet ? T.accent : T.textSub, background: 'none', border: `1px dashed ${notSet ? T.accent : T.borderStrong}`, borderRadius: 7, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>
                    {notSet ? '+ Set budget' : `${Math.round(pct)}% dari ${fmt(budgetAmt)}`}
                  </button>
                )}
              </div>

              {/* Delete confirm inline */}
              {confirmDelete === cat && (
                <div className="slide-in" style={{ marginTop: 12, padding: '10px 12px', background: T.redSub, border: `1px solid ${T.red}33`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 13, color: T.red, fontWeight: 600 }}>
                    {spent > 0 ? `Ada ${fmt(spent)} transaksi terkait. Yakin hapus?` : `Hapus kategori "${cat}"?`}
                  </span>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                    <button onClick={() => deleteCategory(cat)}
                      style={{ background: T.red, border: 'none', color: '#fff', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>
                      Hapus
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px', marginTop: 4 }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 14 }}>RINGKASAN</div>
          {[{ label: 'Total Budget', value: totalBudget, color: T.text }, { label: 'Total Terpakai', value: expense, color: T.red }].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: T.textSub, fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: r.color }}>{fmt(r.value)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: T.border, margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>Sisa Budget</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: totalBudget - expense >= 0 ? T.green : T.red, fontSize: 16 }}>{fmt(totalBudget - expense)}</span>
          </div>
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSaved={() => fetchData()} />}
    </AppShell>
  );
}
