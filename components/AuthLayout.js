"use client";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import "@/app/globals.css";

function AuthContent({ children, title, subtitle }) {
  const { T, dark, toggle, mounted } = useTheme();

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#111110" }} />;

  return (
    <div
      style={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        background: T.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        transition: "background 0.2s",
      }}
    >
      <style suppressHydrationWarning>{`
        ::placeholder { color: ${T.textMuted} !important; }
        a { color: ${T.accent}; text-decoration: none; }
        a:hover { text-decoration: underline; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: T.accent,
                borderRadius: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              💰
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 24,
                color: T.text,
                letterSpacing: -0.5,
              }}
            >
              Fincast
            </span>
          </div>
          <div style={{ fontSize: 15, color: T.textMuted }}>
            Personal Finance & Forecasting
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "32px 28px",
            boxShadow: dark ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: T.text,
                marginBottom: 6,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 14, color: T.textMuted }}>{subtitle}</div>
            )}
          </div>
          {typeof children === "function" ? children({ T }) : children}
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            onClick={toggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              opacity: 0.4,
            }}
          >
            {dark ? "☀️" : "🌑"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <ThemeProvider>
      <AuthContent title={title} subtitle={subtitle}>
        {children}
      </AuthContent>
    </ThemeProvider>
  );
}
