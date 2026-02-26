'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import AddTransactionModal from '@/components/AddTransactionModal';
import MonthNav from '@/components/MonthNav';
import { useTheme } from '@/hooks/useTheme';
import { CAT_COLORS } from '@/lib/theme';
import { fmt, fmtDate } from '@/lib/utils';

export default function TransactionsPage() {
  const { T, mounted } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?month=${month}&year=${year}`);
    setTransactions(res.ok ? await res.json() : []);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  const deleteTransaction = async (id) => {
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (!mounted) return null;

  const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);

  return (
    <AppShell onAddClick={() => setShowAdd(true)}>
      <div className="fade-up">
        <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

        {transactions.length > 0 && (
          <div className="stat-grid" style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'TOTAL', value: `${transactions.length} transaksi`, mono: false, color: T.text },
              { label: 'PEMASUKAN', value: fmt(income), mono: true, color: T.green },
              { label: 'PENGELUARAN', value: fmt(expense), mono: true, color: T.red },
            ].map(s => (
              <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: s.mono ? "'Space Mono', monospace" : 'inherit', fontWeight: 700, fontSize: s.mono ? 13 : 20, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 10 }}>{transactions.length} TRANSAKSI</div>

        {loading ? (
          <div style={{ textAlign: 'center', color: T.textMuted, padding: '40px 0' }}>Memuat...</div>
        ) : transactions.length === 0 ? (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ color: T.textMuted, fontSize: 14 }}>Belum ada transaksi bulan ini</div>
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 14, background: T.accent, border: 'none', color: '#fff', borderRadius: 9, padding: '9px 20px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13 }}>+ Tambah Transaksi</button>
          </div>
        ) : transactions.map(t => (
          <div key={t.id} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, marginBottom: 7, padding: '12px 14px' }}>
            {/* Row layout: icon | info | amount+delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Icon */}
              <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: `${CAT_COLORS[t.category]}18`, border: `1px solid ${CAT_COLORS[t.category]}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: CAT_COLORS[t.category] }}>
                {t.type === 'income' ? '↑' : '↓'}
              </div>

              {/* Info - grows */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: T.textMuted, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</span>
                  <span style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: `${CAT_COLORS[t.category]}18`, color: CAT_COLORS[t.category], whiteSpace: 'nowrap' }}>{t.category}</span>
                </div>
              </div>

              {/* Amount + delete - fixed width, no wrap */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12, color: t.type === 'income' ? T.green : T.red, whiteSpace: 'nowrap' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Number(t.amount))}
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</div>
                </div>
                <button onClick={() => deleteTransaction(t.id)}
                  style={{ flexShrink: 0, background: 'none', border: `1px solid ${T.border}`, color: T.red, borderRadius: 7, width: 26, height: 26, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSaved={tx => setTransactions(prev => [tx, ...prev])} />}
    </AppShell>
  );
}
