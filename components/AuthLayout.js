"use client";
import { useTheme } from "@/hooks/useTheme";

export default function AuthLayout({ children, title, subtitle }) {
    const { T, dark, toggle, mounted } = useTheme();

    if (!mounted)
        return <div style={{ minHeight: "100dvh", background: "#111110" }} />;

    return (
        <div
            style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                background: T.bg,
                /* dvh = actual visible height, not affected by browser chrome */
                minHeight: "100dvh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                /* Safe area padding: top for notch, bottom for home indicator */
                paddingTop: "max(32px, env(safe-area-inset-top, 32px))",
                paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
                paddingLeft: "max(24px, env(safe-area-inset-left, 24px))",
                paddingRight: "max(24px, env(safe-area-inset-right, 24px))",
                transition: "background 0.2s",
            }}
        >
            <style suppressHydrationWarning>{`
        ::placeholder { color: ${T.textMuted} !important; }
        html, body { background: ${T.bg} !important; background-color: ${T.bg} !important; }
        a { color: ${T.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

            <div style={{ width: "100%", maxWidth: 440 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                background: T.accent,
                                borderRadius: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                            }}
                        >
                            💰
                        </div>
                        <span
                            style={{
                                fontWeight: 800,
                                fontSize: 22,
                                color: T.text,
                                letterSpacing: -0.5,
                            }}
                        >
                            Fincast
                        </span>
                    </div>
                    <div style={{ fontSize: 14, color: T.textMuted }}>
                        Personal Finance & Forecasting
                    </div>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 20,
                        padding: "28px 24px",
                        boxShadow: dark
                            ? "none"
                            : "0 4px 24px rgba(0,0,0,0.06)",
                    }}
                >
                    <div style={{ marginBottom: 22 }}>
                        <div
                            style={{
                                fontSize: 21,
                                fontWeight: 800,
                                color: T.text,
                                marginBottom: 5,
                            }}
                        >
                            {title}
                        </div>
                        {subtitle && (
                            <div style={{ fontSize: 14, color: T.textMuted }}>
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {typeof children === "function"
                        ? children({ T })
                        : children}
                </div>

                {/* Theme toggle */}
                <div style={{ textAlign: "center", marginTop: 20 }}>
                    <button
                        onClick={toggle}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 18,
                            opacity: 0.4,
                        }}
                    >
                        {dark ? "☀️" : "🌚"}
                    </button>
                </div>
            </div>
        </div>
    );
}
