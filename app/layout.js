import "./globals.css";
import { ThemeProvider } from "@/hooks/useTheme";

export const metadata = {
    title: "Fincast",
    description: "Personal Finance & Forecasting",
};

export default function RootLayout({ children }) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                {/* viewport-fit=cover is THE key — tells Safari to extend into notch/home bar areas */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                {/* theme-color matches app bg so status bar blends in on iOS */}
                <meta
                    name="theme-color"
                    content="#111110"
                    media="(prefers-color-scheme: dark)"
                />
                <meta
                    name="theme-color"
                    content="#F7F6F3"
                    media="(prefers-color-scheme: light)"
                />
                {/* Make it installable as PWA-like full screen on iOS */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
            </head>
            <body suppressHydrationWarning>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
