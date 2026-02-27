"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { LIGHT, DARK } from "@/lib/theme";

export const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("fincast_theme");
        const isDark = saved
            ? saved === "dark"
            : window.matchMedia("(prefers-color-scheme: dark)").matches;
        setDark(isDark);
        // Set body/html bg immediately to prevent white flash on Safari
        const bg = isDark ? "#111110" : "#F7F6F3";
        document.documentElement.style.background = bg;
        document.documentElement.style.backgroundColor = bg;
        document.body.style.background = bg;
        document.body.style.backgroundColor = bg;
        if (isDark) document.documentElement.classList.add("dark-theme");
        else document.documentElement.classList.remove("dark-theme");
        setMounted(true);
    }, []);

    const toggle = () => {
        setDark((prev) => {
            const next = !prev;
            localStorage.setItem("fincast_theme", next ? "dark" : "light");
            const bg = next ? "#111110" : "#F7F6F3";
            document.documentElement.style.background = bg;
            document.documentElement.style.backgroundColor = bg;
            document.body.style.background = bg;
            document.body.style.backgroundColor = bg;
            if (next) document.documentElement.classList.add("dark-theme");
            else document.documentElement.classList.remove("dark-theme");
            return next;
        });
    };

    return (
        <ThemeCtx.Provider
            value={{ dark, toggle, T: dark ? DARK : LIGHT, mounted }}
        >
            {children}
        </ThemeCtx.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeCtx);
    if (!ctx)
        return { dark: false, toggle: () => {}, T: LIGHT, mounted: false };
    return ctx;
}
