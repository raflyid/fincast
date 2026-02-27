"use client";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { CATEGORIES } from "@/lib/theme";
import { formatAmountDisplay, parseAmount } from "@/lib/utils";
import { Select } from "./ui/Select";
import { DatePicker } from "./ui/DatePicker";
import { toast } from "./ui/GoeyToast";

export default function AddTransactionModal({ onClose, onSaved }) {
    const { T } = useTheme();
    const [form, setForm] = useState({
        type: "expense",
        description: "",
        date: new Date().toISOString().split("T")[0],
        category: "Makan",
    });
    const [amountDisplay, setAmountDisplay] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const inp = {
        background: T.surfaceAlt,
        border: `1px solid ${T.border}`,
        color: T.text,
        borderRadius: 11,
        padding: "12px 14px",
        fontFamily: "inherit",
        fontSize: 15,
        outline: "none",
        width: "100%",
        transition: "border-color 0.15s",
    };

    const save = async () => {
        const amt = parseAmount(amountDisplay);
        if (!form.description.trim()) {
            setError("Deskripsi wajib diisi");
            return;
        }
        if (!amt) {
            setError("Nominal wajib diisi");
            return;
        }
        setSaving(true);
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, amount: amt }),
        });
        setSaving(false);
        if (!res.ok) {
            setError("Gagal menyimpan");
            return;
        }
        const saved = await res.json();
        toast(
            form.type === "income"
                ? `Pemasukan ditambahkan 🎉`
                : `Pengeluaran dicatat ✓`,
        );
        onSaved?.(saved);
        onClose();
    };

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <div
                className="slide-in"
                style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 20,
                    padding: "24px",
                    width: "100%",
                    maxWidth: 460,
                    boxShadow: T.shadowMd,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <div
                        style={{ fontWeight: 800, fontSize: 18, color: T.text }}
                    >
                        Tambah Transaksi
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: T.surfaceAlt,
                            border: `1px solid ${T.border}`,
                            color: T.textSub,
                            borderRadius: 8,
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            fontSize: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Type toggle */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 18,
                        background: T.surfaceAlt,
                        padding: 4,
                        borderRadius: 12,
                    }}
                >
                    {["expense", "income"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setForm({ ...form, type })}
                            style={{
                                flex: 1,
                                background:
                                    form.type === type ? T.surface : "none",
                                border: "none",
                                color:
                                    form.type === type
                                        ? type === "income"
                                            ? T.green
                                            : T.red
                                        : T.textSub,
                                borderRadius: 9,
                                padding: "10px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontWeight: 700,
                                fontSize: 14,
                                transition: "all 0.15s",
                                boxShadow:
                                    form.type === type
                                        ? "0 1px 4px rgba(0,0,0,0.08)"
                                        : "none",
                            }}
                        >
                            {type === "income"
                                ? "↑ Pemasukan"
                                : "↓ Pengeluaran"}
                        </button>
                    ))}
                </div>

                {error && (
                    <div
                        style={{
                            background: T.redSub,
                            color: T.red,
                            borderRadius: 9,
                            padding: "10px 14px",
                            fontSize: 13,
                            marginBottom: 12,
                            fontWeight: 600,
                        }}
                    >
                        {error}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: T.textMuted,
                                display: "block",
                                marginBottom: 6,
                                letterSpacing: 0.5,
                            }}
                        >
                            DESKRIPSI
                        </label>
                        <input
                            placeholder="Contoh: Makan siang, Gaji bulan ini..."
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            onKeyDown={(e) => e.key === "Enter" && save()}
                            style={inp}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: T.textMuted,
                                display: "block",
                                marginBottom: 6,
                                letterSpacing: 0.5,
                            }}
                        >
                            NOMINAL
                        </label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: 14,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 13,
                                    color: T.textMuted,
                                    fontFamily: "'Space Mono', monospace",
                                    pointerEvents: "none",
                                    fontWeight: 700,
                                }}
                            >
                                Rp
                            </span>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                value={amountDisplay}
                                onChange={(e) =>
                                    setAmountDisplay(
                                        formatAmountDisplay(e.target.value),
                                    )
                                }
                                onKeyDown={(e) => e.key === "Enter" && save()}
                                style={{
                                    ...inp,
                                    fontFamily: "'Space Mono', monospace",
                                    paddingLeft: 40,
                                }}
                            />
                        </div>
                    </div>

                    <div
                        className="modal-grid"
                        style={{ display: "grid", gap: 10 }}
                    >
                        <div>
                            <label
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: T.textMuted,
                                    display: "block",
                                    marginBottom: 6,
                                    letterSpacing: 0.5,
                                }}
                            >
                                TANGGAL
                            </label>
                            <DatePicker
                                value={form.date}
                                onChange={(d) => setForm({ ...form, date: d })}
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: T.textMuted,
                                    display: "block",
                                    marginBottom: 6,
                                    letterSpacing: 0.5,
                                }}
                            >
                                KATEGORI
                            </label>
                            <Select
                                value={form.category}
                                onChange={(v) =>
                                    setForm({ ...form, category: v })
                                }
                                options={CATEGORIES}
                            />
                        </div>
                    </div>

                    <button
                        onClick={save}
                        disabled={saving}
                        style={{
                            background: T.accent,
                            border: "none",
                            color: "#fff",
                            borderRadius: 11,
                            padding: "14px",
                            cursor: saving ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                            fontWeight: 700,
                            fontSize: 15,
                            marginTop: 4,
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        {saving ? "Menyimpan..." : "Simpan Transaksi"}
                    </button>
                </div>
            </div>
        </div>
    );
}
