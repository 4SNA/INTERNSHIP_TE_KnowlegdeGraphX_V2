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

import { AuthProvider } from "@/context/AuthContext";
import { SessionProvider } from "@/context/SessionContext";
import { DocumentProvider } from "@/context/DocumentContext";
import { ChatProvider } from "@/context/ChatContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { PopoverProvider } from "@/context/PopoverContext";
import { GlobalPopover } from "@/components/GlobalPopover";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`} suppressHydrationWarning>
      <body className="bg-zinc-950 text-zinc-50 font-sans min-h-screen selection:bg-indigo-500/30">
        <AuthProvider>
          <SessionProvider>
            <DocumentProvider>
              <ChatProvider>
                <WebSocketProvider>
                  <PopoverProvider>
                    {children}
                    <GlobalPopover />
                  </PopoverProvider>
                </WebSocketProvider>
              </ChatProvider>
            </DocumentProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
