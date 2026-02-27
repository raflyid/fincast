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
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
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
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                {/* Inline script: set bg color BEFORE React hydrates to prevent white flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('fincast_theme');
              var isDark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
              var bg = isDark ? '#111110' : '#F7F6F3';
              document.documentElement.style.background = bg;
              document.documentElement.style.backgroundColor = bg;
              document.body && (document.body.style.background = bg);
              document.body && (document.body.style.backgroundColor = bg);
              // Add class so CSS can react immediately before React mounts
              if (isDark) document.documentElement.classList.add('dark-theme');
            } catch(e) {}
          })();
        `,
                    }}
                />
            </head>
            <body suppressHydrationWarning>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
