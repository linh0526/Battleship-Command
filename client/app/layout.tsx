import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./layout.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackgroundWrapper from "@/components/layout/BackgroundWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import { GameProvider } from "@/context/GameContext";
import { SocketProvider } from "@/context/SocketContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BATTLESHIP COMMAND",
  description: "Global Fleet Defense Network - Premium Battleship Experience",
};

import LayoutWrapper from "@/components/layout/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0a0e1a] text-slate-100 min-h-screen`}
      >
        <AuthProvider>
          <LanguageProvider>
            <SettingsProvider>
              <GameProvider>
                <SocketProvider>
                  <LayoutWrapper>
                    <div className="absolute inset-0 -z-50">
                      <BackgroundWrapper />
                    </div>
                    <Header />
                    <main className="main-content">
                      <div className="content-wrapper">
                          {children}
                      </div>
                    </main>
                    <Footer />
                  </LayoutWrapper>
                </SocketProvider>
              </GameProvider>
            </SettingsProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
