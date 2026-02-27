"use client";
import { useState, useEffect, useCallback } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import AppShell from "@/components/AppShell";
import AddTransactionModal from "@/components/AddTransactionModal";
import MonthNav from "@/components/MonthNav";
import { useTheme } from "@/hooks/useTheme";
import { CAT_COLORS, CATEGORIES } from "@/lib/theme";
import { fmt, fmtShort, fmtDate, buildDailyData } from "@/lib/utils";

// FitText: dynamically shrinks font to fit container
function FitText({ value, color, large }) {
    const len = value ? value.replace(/[^0-9]/g, "").length : 0;
    // Scale font based on digit count
    let fs;
    if (large) {
        if (len <= 8) fs = 28;
        else if (len <= 10) fs = 22;
        else if (len <= 12) fs = 18;
        else fs = 14;
    } else {
        if (len <= 8) fs = 18;
        else if (len <= 10) fs = 14;
        else if (len <= 12) fs = 12;
        else fs = 11;
    }
    return (
        <div
            style={{
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: fs,
                color,
                lineHeight: 1.2,
                wordBreak: "keep-all",
                whiteSpace: "nowrap",
                overflow: "hidden",
            }}
        >
            {value}
        </div>
    );
}

// Custom tooltip - colors always match theme
function ChartTooltip({ active, payload, label, T, labelPrefix = "" }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "10px 13px",
                boxShadow: T.shadowMd,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                minWidth: 140,
            }}
        >
            {label != null && (
                <div
                    style={{
                        fontSize: 11,
                        color: T.textMuted,
                        marginBottom: 7,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                    }}
                >
                    {labelPrefix}
                    {label}
                </div>
            )}
            {payload.map((p, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        marginBottom: i < payload.length - 1 ? 4 : 0,
                    }}
                >
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: p.fill ?? p.color,
                            flexShrink: 0,
                        }}
                    />
                    <span style={{ color: T.textSub }}>{p.name}:</span>
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: 700,
                            color: T.text,
                        }}
                    >
                        {fmt(p.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

function PieTooltip({ active, payload, T }) {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
        <div
            style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "9px 13px",
                boxShadow: T.shadowMd,
                fontFamily: "'Cabinet Grotesk', sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 13,
                }}
            >
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: p.payload?.fill ?? CAT_COLORS[p.name],
                        flexShrink: 0,
                    }}
                />
                <span style={{ color: T.textSub }}>{p.name}:</span>
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        color: T.text,
                    }}
                >
                    {fmt(p.value)}
                </span>
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

    useEffect(() => {
        if (mounted) fetchData();
    }, [mounted, fetchData]);

    if (!mounted) return null;

    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((a, t) => a + Number(t.amount), 0);
    const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((a, t) => a + Number(t.amount), 0);
    const balance = income - expense;

    const catExpenses = {};
    CATEGORIES.forEach((c) => {
        catExpenses[c] = transactions
            .filter((t) => t.type === "expense" && t.category === c)
            .reduce((a, t) => a + Number(t.amount), 0);
    });

    const dailyData = buildDailyData(transactions);
    // For category bar: include actual fill color per bar so tooltip matches
    const catBarData = CATEGORIES.map((cat) => ({
        name: cat,
        value: catExpenses[cat],
        budget: budget[cat] || 0,
        fill: CAT_COLORS[cat],
    }));
    const pieData = CATEGORIES.filter((cat) => catExpenses[cat] > 0).map(
        (cat) => ({
            name: cat,
            value: catExpenses[cat],
            fill: CAT_COLORS[cat],
        }),
    );

    const card = {
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "18px 16px",
    };

    return (
        <AppShell onAddClick={() => setShowAdd(true)}>
            <div className="fade-up">
                <MonthNav
                    month={month}
                    year={year}
                    onChange={(m, y) => {
                        setMonth(m);
                        setYear(y);
                    }}
                />

                {/* Stat cards — desktop: 3 columns, mobile: saldo full-width top, income+expense below */}
                {/* Desktop layout (handled by stat-grid CSS class) */}
                <div
                    className="stat-grid stat-grid-desktop"
                    style={{ display: "grid", gap: 10, marginBottom: 14 }}
                >
                    {[
                        {
                            label: "TOTAL SALDO",
                            value: balance,
                            color: T.accent,
                        },
                        { label: "PEMASUKAN", value: income, color: T.green },
                        { label: "PENGELUARAN", value: expense, color: T.red },
                    ].map((s) => (
                        <div key={s.label} style={card}>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: T.textMuted,
                                    fontWeight: 700,
                                    letterSpacing: 0.8,
                                    marginBottom: 10,
                                }}
                            >
                                {s.label}
                            </div>
                            <FitText value={fmt(s.value)} color={s.color} />
                        </div>
                    ))}
                </div>
                {/* Mobile layout: saldo full top, pemasukan+pengeluaran 2-col below */}
                <div
                    className="stat-grid-mobile"
                    style={{ gap: 10, marginBottom: 14 }}
                >
                    <div style={{ ...card, marginBottom: 10 }}>
                        <div
                            style={{
                                fontSize: 10,
                                color: T.textMuted,
                                fontWeight: 700,
                                letterSpacing: 0.8,
                                marginBottom: 10,
                            }}
                        >
                            TOTAL SALDO
                        </div>
                        <FitText value={fmt(balance)} color={T.accent} large />
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                        }}
                    >
                        {[
                            {
                                label: "PEMASUKAN",
                                value: income,
                                color: T.green,
                            },
                            {
                                label: "PENGELUARAN",
                                value: expense,
                                color: T.red,
                            },
                        ].map((s) => (
                            <div key={s.label} style={card}>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: T.textMuted,
                                        fontWeight: 700,
                                        letterSpacing: 0.8,
                                        marginBottom: 10,
                                    }}
                                >
                                    {s.label}
                                </div>
                                <FitText value={fmt(s.value)} color={s.color} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily bar chart */}
                <div style={{ ...card, marginBottom: 14 }}>
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            marginBottom: 3,
                            color: T.text,
                        }}
                    >
                        Aktivitas Harian
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: T.textMuted,
                            marginBottom: 16,
                        }}
                    >
                        Pemasukan & pengeluaran per hari
                    </div>
                    {dailyData.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                color: T.textMuted,
                                fontSize: 14,
                                padding: "40px 0",
                            }}
                        >
                            Belum ada transaksi bulan ini
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={dailyData}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: 0,
                                    bottom: 0,
                                }}
                                barGap={2}
                                barCategoryGap="35%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={T.border}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    tick={{
                                        fontSize: 11,
                                        fill: T.textMuted,
                                        fontFamily: "'Space Mono', monospace",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={
                                        dailyData.length > 20
                                            ? 2
                                            : dailyData.length > 10
                                              ? 1
                                              : 0
                                    }
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 11,
                                        fill: T.textMuted,
                                        fontFamily: "'Space Mono', monospace",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={fmtShort}
                                    width={52}
                                />
                                <Tooltip
                                    content={
                                        <ChartTooltip
                                            T={T}
                                            labelPrefix="Tgl "
                                        />
                                    }
                                    cursor={{ fill: T.surfaceAlt, radius: 4 }}
                                />
                                <Bar
                                    dataKey="income"
                                    name="Pemasukan"
                                    fill={T.green}
                                    fillOpacity={0.85}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={26}
                                />
                                <Bar
                                    dataKey="expense"
                                    name="Pengeluaran"
                                    fill={T.red}
                                    fillOpacity={0.85}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={26}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                        {[
                            { label: "Pemasukan", color: T.green },
                            { label: "Pengeluaran", color: T.red },
                        ].map((l) => (
                            <div
                                key={l.label}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 12,
                                    color: T.textSub,
                                }}
                            >
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 2,
                                        background: l.color,
                                    }}
                                />
                                {l.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category bar + pie */}
                <div
                    className="chart-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "3fr 2fr",
                        gap: 12,
                        marginBottom: 14,
                    }}
                >
                    {/* Pengeluaran vs Budget */}
                    <div style={card}>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                marginBottom: 16,
                                color: T.text,
                            }}
                        >
                            Pengeluaran vs Budget
                        </div>
                        <ResponsiveContainer width="100%" height={210}>
                            <BarChart
                                data={catBarData}
                                margin={{
                                    top: 4,
                                    right: 8,
                                    left: 0,
                                    bottom: 30,
                                }}
                                barGap={3}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={T.border}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 10,
                                        fill: T.textMuted,
                                        fontFamily:
                                            "'Cabinet Grotesk', sans-serif",
                                        fontWeight: 500,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-35}
                                    textAnchor="end"
                                    height={44}
                                />
                                <YAxis
                                    tick={{
                                        fontSize: 11,
                                        fill: T.textMuted,
                                        fontFamily: "'Space Mono', monospace",
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={fmtShort}
                                    width={52}
                                />
                                {/* Custom tooltip that uses the bar's own fill color */}
                                <Tooltip
                                    cursor={{ fill: T.surfaceAlt, radius: 4 }}
                                    content={({ active, payload, label }) => {
                                        if (!active || !payload?.length)
                                            return null;
                                        return (
                                            <div
                                                style={{
                                                    background: T.surface,
                                                    border: `1px solid ${T.border}`,
                                                    borderRadius: 10,
                                                    padding: "10px 13px",
                                                    boxShadow: T.shadowMd,
                                                    fontFamily:
                                                        "'Cabinet Grotesk', sans-serif",
                                                    minWidth: 150,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 700,
                                                        color: T.text,
                                                        marginBottom: 7,
                                                    }}
                                                >
                                                    {label}
                                                </div>
                                                {payload.map((p, i) => {
                                                    // p.dataKey is reliable: 'value' = Terpakai, 'budget' = Budget
                                                    const isBudget =
                                                        p.dataKey === "budget";
                                                    // BUDGET_COLOR must match the bar fill exactly
                                                    const BUDGET_COLOR =
                                                        "#B0B0B0";
                                                    const dotColor = isBudget
                                                        ? BUDGET_COLOR
                                                        : (CAT_COLORS[label] ??
                                                          T.accent);
                                                    return (
                                                        <div
                                                            key={i}
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 8,
                                                                fontSize: 13,
                                                                marginBottom:
                                                                    i <
                                                                    payload.length -
                                                                        1
                                                                        ? 4
                                                                        : 0,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: 2,
                                                                    background:
                                                                        dotColor,
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                            <span
                                                                style={{
                                                                    color: T.textSub,
                                                                }}
                                                            >
                                                                {p.name}:
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontFamily:
                                                                        "'Space Mono', monospace",
                                                                    fontWeight: 700,
                                                                    color: T.text,
                                                                }}
                                                            >
                                                                {fmt(p.value)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    name="Terpakai"
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={22}
                                >
                                    {catBarData.map((d, i) => (
                                        <Cell
                                            key={i}
                                            fill={CAT_COLORS[d.name]}
                                            fillOpacity={0.9}
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="budget"
                                    name="Budget"
                                    radius={[3, 3, 0, 0]}
                                    fill="#B0B0B0"
                                    fillOpacity={1}
                                    maxBarSize={22}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie chart */}
                    <div style={card}>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                marginBottom: 10,
                                color: T.text,
                            }}
                        >
                            Komposisi
                        </div>
                        {pieData.length === 0 ? (
                            <div
                                style={{
                                    color: T.textMuted,
                                    fontSize: 13,
                                    textAlign: "center",
                                    paddingTop: 40,
                                }}
                            >
                                Belum ada data
                            </div>
                        ) : (
                            <>
                                {/* Use fixed height for pie so it doesn't get too small on mobile */}
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="38%"
                                            outerRadius="65%"
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((d, i) => (
                                                <Cell key={i} fill={d.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => (
                                                <PieTooltip
                                                    active={active}
                                                    payload={payload}
                                                    T={T}
                                                />
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "5px 10px",
                                        marginTop: 4,
                                    }}
                                >
                                    {pieData.map((d) => (
                                        <div
                                            key={d.name}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                fontSize: 11,
                                                color: T.textSub,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 7,
                                                    height: 7,
                                                    borderRadius: 2,
                                                    background: d.fill,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {d.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent transactions */}
                <div style={card}>
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            marginBottom: 14,
                            color: T.text,
                        }}
                    >
                        Transaksi Terbaru
                    </div>
                    {transactions.length === 0 ? (
                        <div
                            style={{
                                color: T.textMuted,
                                fontSize: 14,
                                textAlign: "center",
                                padding: "20px 0",
                            }}
                        >
                            Belum ada transaksi. Tekan "+ Tambah".
                        </div>
                    ) : (
                        transactions.slice(0, 5).map((t, i) => (
                            <div
                                key={t.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "10px 0",
                                    borderBottom:
                                        i < Math.min(4, transactions.length - 1)
                                            ? `1px solid ${T.border}`
                                            : "none",
                                }}
                            >
                                <div
                                    style={{
                                        flexShrink: 0,
                                        width: 32,
                                        height: 32,
                                        borderRadius: 9,
                                        background: `${CAT_COLORS[t.category]}18`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 13,
                                        color: CAT_COLORS[t.category],
                                    }}
                                >
                                    {t.type === "income" ? "↑" : "↓"}
                                </div>
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
                                            fontSize: 12,
                                            color: T.textMuted,
                                            marginTop: 1,
                                        }}
                                    >
                                        {fmtDate(t.date)} · {t.category}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        flexShrink: 0,
                                        fontFamily: "'Space Mono', monospace",
                                        fontWeight: 700,
                                        fontSize: 12,
                                        color:
                                            t.type === "income"
                                                ? T.green
                                                : T.red,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {t.type === "income" ? "+" : "-"}
                                    {fmt(Number(t.amount))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
