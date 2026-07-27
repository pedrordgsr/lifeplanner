import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import ThemeScript, { THEME_META_COLOR } from "@/components/theme/ThemeScript";
import PwaStartRedirect from "@/components/pwa/PwaStartRedirect";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Lume Life Planner",
  title: {
    default: "Lume Life Planner",
    template: "%s",
  },
  description:
    "Planner interativo e tranquilo: mapa do mês, planner diário e planejamento semanal.",
  appleWebApp: {
    capable: true,
    title: "Lume",
    statusBarStyle: "default",
  },
};

/**
 * Uma única meta theme-color, no claro: o ThemeToggle a reescreve assim que
 * hidrata. Duas metas com `media` brigariam com a escolha manual do usuário.
 */
export const viewport: Viewport = {
  themeColor: THEME_META_COLOR.light,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme é reescrito pelo ThemeScript antes da hidratação; sem o
    // suppressHydrationWarning o React reclamaria da diferença.
    <html
      lang="pt-BR"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaStartRedirect />
        {children}
      </body>
    </html>
  );
}
