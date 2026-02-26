"use client";
import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import AddTransactionModal from "@/components/AddTransactionModal";
import MonthNav from "@/components/MonthNav";
import { useTheme } from "@/hooks/useTheme";
import { CAT_COLORS } from "@/lib/theme";
import { fmt, fmtDate } from "@/lib/utils";

function FitText({ value, color, mono, large }) {
  const str = value ? String(value) : "";
  const numLen = str.replace(/[^0-9]/g, "").length;
  let fs;
  if (large) {
    fs = numLen <= 8 ? 28 : numLen <= 10 ? 22 : numLen <= 12 ? 18 : 14;
  } else {
    fs = numLen <= 8 ? 18 : numLen <= 10 ? 14 : numLen <= 12 ? 12 : 11;
  }
  return (
    <div
      style={{
        fontFamily: mono
          ? "'Space Mono', monospace"
          : "'Cabinet Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: fs,
        color,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {value}
    </div>
  );
}

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

  useEffect(() => {
    if (mounted) fetchData();
  }, [mounted, fetchData]);

  const deleteTransaction = async (id) => {
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  if (!mounted) return null;

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + Number(t.amount), 0);

  return (
    <AppShell onAddClick={() => setShowAdd(true)}>
      <div>
        <MonthNav
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />

        {transactions.length > 0 && (
          <>
            {/* Desktop: 3 col */}
            <div
              className="stat-grid"
              style={{ display: "grid", gap: 10, marginBottom: 16 }}
            >
              {[
                {
                  label: "TOTAL",
                  value: `${transactions.length} transaksi`,
                  mono: false,
                  color: T.text,
                },
                {
                  label: "PEMASUKAN",
                  value: fmt(income),
                  mono: true,
                  color: T.green,
                },
                {
                  label: "PENGELUARAN",
                  value: fmt(expense),
                  mono: true,
                  color: T.red,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: T.textMuted,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      marginBottom: 8,
                    }}
                  >
                    {stat.label}
                  </div>
                  <FitText
                    value={stat.value}
                    color={stat.color}
                    mono={stat.mono}
                  />
                </div>
              ))}
            </div>
            {/* Mobile: total full-width top, income+expense 2-col below */}
            <div className="stat-grid-mobile" style={{ marginBottom: 16 }}>
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: T.textMuted,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    marginBottom: 8,
                  }}
                >
                  TOTAL
                </div>
                <div
                  style={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: T.text,
                  }}
                >
                  {transactions.length}{" "}
                  <span style={{ fontSize: 15, color: T.textSub }}>
                    transaksi
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  { label: "PEMASUKAN", value: fmt(income), color: T.green },
                  { label: "PENGELUARAN", value: fmt(expense), color: T.red },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: T.textMuted,
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        marginBottom: 8,
                      }}
                    >
                      {stat.label}
                    </div>
                    <FitText value={stat.value} color={stat.color} mono />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div
          style={{
            fontSize: 11,
            color: T.textMuted,
            fontWeight: 700,
            letterSpacing: 0.8,
            marginBottom: 10,
          }}
        >
          {transactions.length} TRANSAKSI
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: T.textMuted,
              padding: "40px 0",
            }}
          >
            Memuat...
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "48px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ color: T.textMuted, fontSize: 14 }}>
              Belum ada transaksi bulan ini
            </div>
            <button
              onClick={() => setShowAdd(true)}
              style={{
                marginTop: 14,
                background: T.accent,
                border: "none",
                color: "#fff",
                borderRadius: 9,
                padding: "9px 20px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              + Tambah Transaksi
            </button>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                marginBottom: 7,
                padding: "12px 14px",
              }}
            >
              {/* Row layout: icon | info | amount+delete */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Icon */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${CAT_COLORS[t.category]}18`,
                    border: `1px solid ${CAT_COLORS[t.category]}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: CAT_COLORS[t.category],
                  }}
                >
                  {t.type === "income" ? "↑" : "↓"}
                </div>

                {/* Info - grows */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: T.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.description}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: T.textMuted,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtDate(t.date)}
                    </span>
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 700,
                        background: `${CAT_COLORS[t.category]}18`,
                        color: CAT_COLORS[t.category],
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Amount + delete - fixed width, no wrap */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: 12,
                        color: t.type === "income" ? T.green : T.red,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmt(Number(t.amount))}
                    </div>
                    <div
                      style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}
                    >
                      {t.type === "income" ? "Masuk" : "Keluar"}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    style={{
                      flexShrink: 0,
                      background: "none",
                      border: `1px solid ${T.border}`,
                      color: T.red,
                      borderRadius: 7,
                      width: 26,
                      height: 26,
                      cursor: "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onSaved={(tx) => setTransactions((prev) => [tx, ...prev])}
        />
      )}
    </AppShell>
  );
}
