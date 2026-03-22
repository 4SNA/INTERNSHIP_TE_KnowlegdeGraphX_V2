import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KnowledgeGraphX | AI-Powered Knowledge Insights",
  description: "Centralized, intelligent, and queryable knowledge system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`} suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-50 font-sans min-h-screen flex selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
