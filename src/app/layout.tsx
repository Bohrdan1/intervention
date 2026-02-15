import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { NavBar } from "@/components/ui/nav-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automatisme & Agencement - Rapports de maintenance",
  description: "Génération de rapports de maintenance préventive et corrective",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} antialiased`}>
        <NavBar />
        <ToastProvider>
          <main className="mx-auto max-w-5xl px-4 py-6">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
