"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/hooks/useTheme";

export function Select({ value, onChange, options, placeholder }) {
    const { T } = useTheme();
    const [open, setOpen] = useState(false);
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef(null);
    const dropRef = useRef(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const updatePos = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const dropHeight = Math.min(options.length * 46, 280);
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < dropHeight + 20 && rect.top > spaceBelow;

        setDropPos({
            left: rect.left,
            width: rect.width,
            ...(openUp
                ? { bottom: window.innerHeight - rect.top + 5, top: undefined }
                : { top: rect.bottom + 5, bottom: undefined }),
        });
    }, [options.length]);

    const handleOpen = () => {
        if (!open) updatePos();
        setOpen((prev) => !prev);
    };

    // Close on outside tap/click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                triggerRef.current?.contains(e.target) ||
                dropRef.current?.contains(e.target)
            )
                return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler, { passive: true });
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [open]);

    // Reposition on scroll / resize
    useEffect(() => {
        if (!open) return;
        window.addEventListener("scroll", updatePos, true);
        window.addEventListener("resize", updatePos);
        return () => {
            window.removeEventListener("scroll", updatePos, true);
            window.removeEventListener("resize", updatePos);
        };
    }, [open, updatePos]);

    const selected = options.find((o) => (o.value ?? o) === value);
    const label = selected
        ? (selected.label ?? selected)
        : (placeholder ?? "Pilih...");

    const dropdown = (
        <div
            ref={dropRef}
            style={{
                position: "fixed",
                top: dropPos.top,
                bottom: dropPos.bottom,
                left: dropPos.left,
                width: dropPos.width,
                zIndex: 9999,
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                overflowY: "auto",
                maxHeight: 280,
                WebkitOverflowScrolling: "touch",
                animation: "dropIn 0.15s ease",
            }}
        >
            {options.map((opt) => {
                const val = opt.value ?? opt;
                const lbl = opt.label ?? opt;
                const isSel = val === value;
                return (
                    <button
                        key={val}
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onChange(val);
                            setOpen(false);
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            onChange(val);
                            setOpen(false);
                        }}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            background: isSel ? T.accentSub : "none",
                            border: "none",
                            borderBottom: `1px solid ${T.border}22`,
                            color: isSel ? T.accent : T.text,
                            padding: "12px 14px",
                            fontFamily:
                                "'Cabinet Grotesk', -apple-system, sans-serif",
                            fontSize: 15,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontWeight: isSel ? 700 : 400,
                            minHeight: 46,
                        }}
                        onMouseEnter={(e) => {
                            if (!isSel)
                                e.currentTarget.style.background = T.surfaceAlt;
                        }}
                        onMouseLeave={(e) => {
                            if (!isSel)
                                e.currentTarget.style.background = isSel
                                    ? T.accentSub
                                    : "none";
                        }}
                    >
                        {lbl}
                        {isSel && (
                            <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={T.accent}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </button>
                );
            })}
        </div>
    );

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <button
                ref={triggerRef}
                type="button"
                onClick={handleOpen}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: T.surfaceAlt,
                    border: `1px solid ${open ? T.accent : T.border}`,
                    color: selected ? T.text : T.textMuted,
                    borderRadius: 11,
                    padding: "12px 14px",
                    fontFamily: "inherit",
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    outline: "none",
                }}
            >
                <span>{label}</span>
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.textMuted}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Portal: render dropdown directly into body, escaping modal overflow & stacking */}
            {mounted && open && createPortal(dropdown, document.body)}
        </div>
    );
}
