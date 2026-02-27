"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// Goey SVG filter for blob morphing effect
const GOEY_FILTER = `
  <svg style="position:absolute;width:0;height:0">
    <defs>
      <filter id="goey-filter">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
          result="goey" />
        <feComposite in="SourceGraphic" in2="goey" operator="atop" />
      </filter>
    </defs>
  </svg>
`;

let toastId = 0;
let globalAddToast = null;

export function toast(message, type = "success") {
    if (globalAddToast) globalAddToast({ id: ++toastId, message, type });
}

export function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        globalAddToast = (t) => {
            setToasts((prev) => [...prev, t]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }, 3200);
        };
        return () => {
            globalAddToast = null;
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: GOEY_FILTER }} />
            <div
                style={{
                    position: "fixed",
                    bottom: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0,
                    filter: "url(#goey-filter)",
                    pointerEvents: "none",
                }}
            >
                {toasts.map((t, i) => (
                    <ToastItem
                        key={t.id}
                        toast={t}
                        index={i}
                        total={toasts.length}
                    />
                ))}
            </div>
        </>
    );
}

function ToastItem({ toast: t, index, total }) {
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Slight delay for goey merge effect when multiple toasts
        const enterTimer = setTimeout(() => setVisible(true), index * 40);
        const leaveTimer = setTimeout(() => setLeaving(true), 2800);
        return () => {
            clearTimeout(enterTimer);
            clearTimeout(leaveTimer);
        };
    }, [index]);

    const bg =
        t.type === "error"
            ? "#D45F4A"
            : t.type === "warning"
              ? "#C4A35A"
              : "#2D9E6B";

    const icon = t.type === "error" ? "✕" : t.type === "warning" ? "!" : "✓";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: bg,
                color: "#fff",
                borderRadius: 100,
                padding: "12px 20px 12px 14px",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                marginBottom: total > 1 && index < total - 1 ? -8 : 0,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                // Goey entrance/exit animation
                opacity: leaving ? 0 : visible ? 1 : 0,
                transform: leaving
                    ? "scale(0.85) translateY(8px)"
                    : visible
                      ? "scale(1) translateY(0)"
                      : "scale(0.85) translateY(12px)",
                transition: leaving
                    ? "opacity 0.3s ease, transform 0.3s ease"
                    : "opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                pointerEvents: "auto",
            }}
        >
            {/* Icon bubble */}
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                }}
            >
                {icon}
            </div>
            {t.message}
        </div>
    );
}
