'use client';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AppShell from '@/components/AppShell';
import AddTransactionModal from '@/components/AddTransactionModal';
import MonthNav from '@/components/MonthNav';
import { useTheme } from '@/hooks/useTheme';
import { CAT_COLORS, CATEGORIES } from '@/lib/theme';
import { fmt, fmtShort, fmtDate, buildDailyData } from '@/lib/utils';

// Custom tooltip that always reads theme from DOM via CSS var — or we pass T as prop
function ChartTooltip({ active, payload, label, T, labelPrefix }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: T.shadowMd, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
      {label && <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6, fontWeight: 600 }}>{labelPrefix ?? ''}{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text, marginBottom: i < payload.length - 1 ? 3 : 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.fill || p.color }} />
          <span style={{ color: T.textSub }}>{p.name}:</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload, T }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: T.shadowMd, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.text }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: p.payload.fill }} />
        <span style={{ color: T.textSub }}>{p.name}:</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>{fmt(p.value)}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { T, mounted } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = useCallback(async () => {
    const [txRes, budgetRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&year=${year}`),
      fetch(`/api/budget?month=${month}&year=${year}`),
    ]);
    setTransactions(txRes.ok ? await txRes.json() : []);
    setBudget(budgetRes.ok ? await budgetRes.json() : {});
  }, [month, year]);

  useEffect(() => { if (mounted) fetchData(); }, [mounted, fetchData]);

  if (!mounted) return null;

  const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
  const balance = income - expense;

  const catExpenses = {};
  CATEGORIES.forEach(c => { catExpenses[c] = transactions.filter(t => t.type === 'expense' && t.category === c).reduce((a, t) => a + Number(t.amount), 0); });

  const dailyData = buildDailyData(transactions);

  // Only include categories that have data to avoid label crowding
  const catBarData = CATEGORIES.map(cat => ({ name: cat, value: catExpenses[cat], budget: budget[cat] || 0 }));
  const pieData = CATEGORIES.filter(cat => catExpenses[cat] > 0).map(cat => ({ name: cat, value: catExpenses[cat] }));

  const card = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 18px' };

  return (
    <AppShell onAddClick={() => setShowAdd(true)}>
      <div className="fade-up">
        <MonthNav month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

        {/* Stat cards */}
        <div className="stat-grid" style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'TOTAL SALDO', value: balance, color: balance >= 0 ? T.green : T.red },
            { label: 'PEMASUKAN', value: income, color: T.green },
            { label: 'PENGELUARAN', value: expense, color: T.red },
          ].map(s => (
            <div key={s.label} style={card}>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 20, color: s.color }}>{fmt(s.value)}</div>
            </div>
          ))}
        </div>

        {/* Daily bar chart */}
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, color: T.text }}>Aktivitas Harian</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>Pemasukan & pengeluaran per hari</div>
          {dailyData.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.textMuted, fontSize: 14, padding: '40px 0' }}>Belum ada transaksi bulan ini</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: T.textMuted, fontFamily: "'Space Mono', monospace" }}
                  axisLine={false} tickLine={false}
                  // Only show every other tick if many days
                  interval={dailyData.length > 15 ? 1 : 0}
                />
                <YAxis tick={{ fontSize: 11, fill: T.textMuted, fontFamily: "'Space Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={46} />
                <Tooltip content={<ChartTooltip T={T} labelPrefix="Tgl " />} cursor={{ fill: T.surfaceAlt }} />
                <Bar dataKey="income" name="Pemasukan" fill={T.green} fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expense" name="Pengeluaran" fill={T.red} fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {[{ label: 'Pemasukan', color: T.green }, { label: 'Pengeluaran', color: T.red }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.textSub }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Category bar + pie */}
        <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 14 }}>
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: T.text }}>Pengeluaran vs Budget</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catBarData} margin={{ top: 4, right: 4, left: -24, bottom: 20 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: T.textMuted, fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 500 }}
                  axisLine={false} tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={40}
                />
                <YAxis tick={{ fontSize: 10, fill: T.textMuted, fontFamily: "'Space Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={44} />
                <Tooltip content={<ChartTooltip T={T} />} cursor={{ fill: T.surfaceAlt }} />
                <Bar dataKey="value" name="Terpakai" radius={[3, 3, 0, 0]}>
                  {catBarData.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.name]} fillOpacity={0.85} />)}
                </Bar>
                <Bar dataKey="budget" name="Budget" radius={[3, 3, 0, 0]} fill={T.borderStrong} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: T.text }}>Komposisi</div>
            {pieData.length === 0 ? (
              <div style={{ color: T.textMuted, fontSize: 13, textAlign: 'center', paddingTop: 40 }}>Belum ada data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={2} dataKey="value">
                      {pieData.map((d, i) => <Cell key={i} fill={CAT_COLORS[d.name]} />)}
                    </Pie>
                    <Tooltip content={({ active, payload }) => <PieTooltip active={active} payload={payload} T={T} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px' }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T.textSub }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: CAT_COLORS[d.name] }} />{d.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: T.text }}>Transaksi Terbaru</div>
          {transactions.length === 0 ? (
            <div style={{ color: T.textMuted, fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Belum ada transaksi. Tekan "+ Tambah".</div>
          ) : transactions.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: i < Math.min(4, transactions.length - 1) ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${CAT_COLORS[t.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: CAT_COLORS[t.category] }}>{t.type === 'income' ? '↑' : '↓'}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{fmtDate(t.date)} · {t.category}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, color: t.type === 'income' ? T.green : T.red }}>
                {t.type === 'income' ? '+' : '-'}{fmt(Number(t.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} onSaved={tx => setTransactions(prev => [tx, ...prev])} />}
    </AppShell>
  );
}
