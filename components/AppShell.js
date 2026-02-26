"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: (c) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transaksi",
    path: "/transactions",
    icon: (c) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "budget",
    label: "Budget",
    path: "/budget",
    icon: (c) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    id: "forecast",
    label: "Forecast",
    path: "/forecast",
    icon: (c) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

function Shell({ children, onAddClick }) {
  const { T, dark, toggle, mounted } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login";
          return null;
        }
        return r.json();
      })
      .then((d) => d && setUser(d));
  }, []);

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#111110" }} />;

  return (
    <div
      style={{
        fontFamily: "'Cabinet Grotesk', sans-serif",
        background: T.bg,
        minHeight: "100vh",
        color: T.text,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      <style suppressHydrationWarning>{`
        ::placeholder { color: ${T.textMuted} !important; }
        select option { background: ${T.surface}; color: ${T.text}; }
      `}</style>

      {/* TOP HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
          background: T.headerBg,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div
          className="header-pad"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: T.accent,
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              💰
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: T.text,
                letterSpacing: -0.4,
              }}
            >
              Fincast
            </span>
          </div>

          {/* Desktop tabs - hidden on mobile via CSS */}
          <div
            className="desktop-tabs"
            style={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {TABS.map((tab) => {
              const active = pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: active ? T.surfaceAlt : "none",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? T.text : T.textSub,
                    transition: "all 0.15s",
                  }}
                >
                  {tab.icon(active ? T.text : T.textSub)}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {user && (
              <span
                className="desktop-only"
                style={{ fontSize: 13, color: T.textMuted }}
              >
                Hi, <b style={{ color: T.text }}>{user.username}</b>
              </span>
            )}
            <button
              onClick={toggle}
              style={{
                background: T.surfaceAlt,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                width: 34,
                height: 34,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
              }}
            >
              {dark ? "☀️" : "🌑"}
            </button>
            <button
              onClick={onAddClick}
              style={{
                background: T.accent,
                border: "none",
                color: "#fff",
                borderRadius: 9,
                padding: "0 14px",
                height: 34,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              + Tambah
            </button>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
              className="desktop-only"
              style={{
                background: "none",
                border: `1px solid ${T.border}`,
                color: T.textSub,
                borderRadius: 8,
                padding: "0 12px",
                height: 34,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            >
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div
        className="main-content"
        style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 24px 80px" }}
      >
        {children}
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className="mobile-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: T.headerBg,
          borderTop: `1px solid ${T.border}`,
          backdropFilter: "blur(20px)",
          paddingBottom: "env(safe-area-inset-bottom)",
          fontFamily: "'Cabinet Grotesk', sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 56 }}>
          {TABS.map((tab) => {
            const active = pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: "25%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                  color: active ? T.accent : T.textMuted,
                }}
              >
                {tab.icon(active ? T.accent : T.textMuted)}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    fontFamily:
                      "'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            style={{
              width: 48,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              color: T.textMuted,
              borderLeft: `1px solid ${T.border}`,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={T.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 500,
                color: T.textMuted,
              }}
            >
              Keluar
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function AppShell({ children, onAddClick }) {
  return <Shell onAddClick={onAddClick}>{children}</Shell>;
}
