'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import AddTransactionModal from '@/components/AddTransactionModal';
import MonthNav from '@/components/MonthNav';
import { useTheme } from '@/hooks/useTheme';
import { CAT_COLORS, CATEGORIES } from '@/lib/theme';
import { fmt, formatAmountDisplay, parseAmount, MONTHS_FULL } from '@/lib/utils';

export default function ForecastPage() {
  const { T, mounted } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [forecastItems, setForecastItems] = useState([]);
  const [budget, setBudget] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [activeFcForm, setActiveFcForm] = useState(null);
  const [fcForm, setFcForm] = useState({ description: '' });
  const [fcAmountDisplay, setFcAmountDisplay] = useState('');

  const fetchData = useCallback(async () => {
    const [txRes, fcRes, budgetRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&year=${year}`),
      fetch(`/api/forecast?month=${month}&year=${year}`),
      fetch(`/api/budget?month=${month}&year=${year}`),
    ]);
    setTransactions(txRes.ok ? await txRes.json() : []);
    setForecastItems(fcRes.ok ? await fcRes.json() : []);
    setBudget(budgetRes.ok ? await budgetRes.json() : {});
  }, [month, year]);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  const addForecastItem = async (cat) => {
    const amt = parseAmount(fcAmountDisplay);
    if (!fcForm.description || !amt) return;
    const res = await fetch('/api/forecast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, description: fcForm.description, amount: amt, month, year }),
    });
    if (res.ok) { const item = await res.json(); setForecastItems(prev => [...prev, item]); }
    setFcForm({ description: '' }); setFcAmountDisplay(''); setActiveFcForm(null);
  };

  const removeForecastItem = async (id) => {
    await fetch(`/api/forecast?id=${id}`, { method: 'DELETE' });
    setForecastItems(prev => prev.filter(i => i.id !== id));
  };

  if (!mounted) return null;

  const catExpenses = {};
  CATEGORIES.forEach(c => { catExpenses[c] = transactions.filter(t => t.type === 'expense' && t.category === c).reduce((a, t) => a + Number(t.amount), 0); });
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
  const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);

  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDay = (month === now.getMonth() + 1 && year === now.getFullYear()) ? now.getDate() : daysInMonth;
  const forecastFactor = daysInMonth / Math.max(currentDay, 1);

  const manualByCategory = {};
  CATEGORIES.forEach(cat => { manualByCategory[cat] = forecastItems.filter(i => i.category === cat).reduce((a, i) => a + Number(i.amount), 0); });

  const forecastTotal = Math.round(expense * forecastFactor) + Object.values(manualByCategory).reduce((a, b) => a + b, 0);
  const forecastDiff = forecastTotal - income;

  const inp = (extra = {}) => ({ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.text, borderRadius: 10, padding: '9px 12px', fontFamily: 'inherit', fontSize: 14, outline: 'none', ...extra });

  return (
    <AppShell onAddClick={() => setShowAdd(true)}>
      <div className="fade-up">
        <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

        {/* Summary card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '22px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 6 }}>PROYEKSI PENGELUARAN {MONTHS_FULL[month-1].toUpperCase()} {year}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 28, color: forecastDiff > 0 ? T.red : T.green, marginBottom: 8 }}>{fmt(forecastTotal)}</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Berdasarkan data {currentDay} hari → proyeksi {daysInMonth} hari + input manual</div>
          <div style={{ marginTop: 12, padding: '10px 14px', background: forecastDiff > 0 ? T.redSub : T.greenSub, borderRadius: 10, fontSize: 14, color: forecastDiff > 0 ? T.red : T.green, fontWeight: 700 }}>
            {forecastDiff > 0 ? `⚠️ Melebihi pemasukan ${fmt(forecastDiff)}` : `✅ Surplus ${fmt(Math.abs(forecastDiff))}`}
          </div>
        </div>

        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 12 }}>FORECAST PER KATEGORI</div>

        {CATEGORIES.map(cat => {
          const spent = catExpenses[cat];
          const base = Math.round(spent * forecastFactor);
          const manual = manualByCategory[cat];
          const total = base + manual;
          const budgetAmt = budget[cat] || 0;
          const over = budgetAmt > 0 && total > budgetAmt;
          const items = forecastItems.filter(i => i.category === cat);

          return (
            <div key={cat} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 9 }}>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 3, background: CAT_COLORS[cat] }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{cat}</span>
                    {items.length > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: T.accentSub, color: T.accent, fontWeight: 700 }}>+{items.length}</span>}
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: budgetAmt === 0 ? T.surfaceAlt : over ? T.redSub : T.greenSub, color: budgetAmt === 0 ? T.textMuted : over ? T.red : T.green }}>
                    {budgetAmt === 0 ? 'Budget belum diset' : over ? '⚠️ Over budget' : '✓ Aman'}
                  </span>
                </div>

                <div className="fc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[{ label: 'Proyeksi Dasar', val: base }, { label: 'Manual Tambahan', val: manual, hi: true }, { label: 'Total Proyeksi', val: total, bold: true }].map(({ label, val, hi, bold }) => (
                    <div key={label} style={{ background: T.surfaceAlt, borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 5, fontWeight: 600 }}>{label}</div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: bold ? 700 : 600, fontSize: 12, color: hi ? T.accent : T.text }}>{fmt(val)}</div>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 11px', background: T.accentSub, borderRadius: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: T.text }}>{item.description}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: T.accent }}>{fmt(Number(item.amount))}</span>
                          <button onClick={() => removeForecastItem(item.id)} style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeFcForm === cat ? (
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input placeholder="Deskripsi..." value={fcForm.description}
                      onChange={e => setFcForm({ description: e.target.value })}
                      style={{ ...inp({ flex: '2 1 140px', minWidth: 0 }) }} />
                    <div style={{ position: 'relative', flex: '1 1 100px', minWidth: 0 }}>
                      <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: T.textMuted, fontFamily: "'Space Mono', monospace", pointerEvents: 'none' }}>Rp</span>
                      <input type="text" inputMode="numeric" placeholder="0" value={fcAmountDisplay}
                        onChange={e => setFcAmountDisplay(formatAmountDisplay(e.target.value))}
                        onKeyDown={e => e.key === 'Enter' && addForecastItem(cat)}
                        style={{ ...inp({ paddingLeft: 28, fontFamily: "'Space Mono', monospace", width: '100%' }) }} />
                    </div>
                    <button onClick={() => addForecastItem(cat)} style={{ background: T.accent, border: 'none', color: '#fff', borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>Simpan</button>
                    <button onClick={() => setActiveFcForm(null)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 9, padding: '9px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Batal</button>
                  </div>
                ) : (
                  <button onClick={() => { setActiveFcForm(cat); setFcForm({ description: '' }); setFcAmountDisplay(''); }}
                    style={{ background: 'none', border: `1px dashed ${T.borderStrong}`, color: T.textSub, borderRadius: 9, padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, width: '100%', transition: 'border-color 0.15s' }}>
                    + Tambah Pengeluaran Manual
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Tips */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px', marginTop: 4 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 8 }}>💡 TIPS PENGHEMATAN</div>
          {expense > 0 ? (
            <div style={{ fontSize: 14, color: T.textSub, lineHeight: 1.7 }}>
              Pengeluaran terbesar di <b style={{ color: T.text }}>{Object.entries(catExpenses).sort((a, b) => b[1] - a[1])[0][0]}</b>. Kurangi 20% dan hemat{' '}
              <b style={{ fontFamily: "'Space Mono', monospace", color: T.green }}>{fmt(Object.values(catExpenses).sort((a, b) => b - a)[0] * 0.2)}</b> bulan ini.
            </div>
          ) : <div style={{ fontSize: 14, color: T.textSub }}>Tambah transaksi untuk melihat tips penghematan.</div>}
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSaved={() => fetchData()} />}
    </AppShell>
  );
}
