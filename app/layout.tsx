import { Lato, Bai_Jamjuree } from "next/font/google";

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import PageLoader from "@/components/shared/PageLoader";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CurrencyProvider } from "@/components/providers/CurrencyProvider";
import { CURRENCY_COOKIE } from "@/lib/currency/constants";
import { defaultMetadata } from "@/config/metadata.config";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--body-font",
});

const inter = Inter({
  subsets: ["latin"],
});

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--heading-font",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const htmlLang = store.get("NEXT_LOCALE")?.value ?? "en";
  const currencyCookie = store.get(CURRENCY_COOKIE)?.value ?? null;

  return (
    <html lang={htmlLang} className={`${lato.variable} ${baiJamjuree.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=localStorage.getItem('theme');var v=localStorage.getItem('themeVariant');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var mode=m||(d?'dark':'light');var variant=v||'ocean';if(mode==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-theme',variant);})();`,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-background`}>
        <AnalyticsScripts />
        <ThemeProvider defaultTheme="system">
          <CurrencyProvider initialCurrencyCode={currencyCookie}>
            <AuthProvider>
              <PageLoader />
              {children}
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
