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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
