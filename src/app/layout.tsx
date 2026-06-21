import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const description =
  "A modern platform to discover, create, and register for campus & community events — with Google Calendar sync and role-based access.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eventra — Event Registration System",
    template: "%s · Eventra",
  },
  description,
  applicationName: "Eventra",
  keywords: ["events", "registration", "calendar", "workshops", "seminars"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Eventra",
    title: "Eventra — Event Registration System",
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eventra — Event Registration System",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
