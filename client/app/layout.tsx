import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./layout.css";
import Header from "@/components/layout/Header";
import { LanguageProvider } from "@/context/LanguageContext";
import { GameProvider } from "@/context/GameContext";
import { SocketProvider } from "@/context/SocketContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BATTLESHIP COMMAND | Tactical Neural Network",
  description: "Global Fleet Defense Network - Premium Battleship Experience",
};

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
        <LanguageProvider>
          <GameProvider>
            <SocketProvider>
              <div className="app-container">
                <Header />
                <main className="main-content">
                   <div className="content-wrapper">
                      {children}
                   </div>
                </main>
                {/* <footer className="app-footer">
                   <div className="content-wrapper px-6">
                      <p className="text-slate-600 text-[10px] font-mono tracking-[0.5em] uppercase opacity-50 italic">
                        Bum Boom bum bum zzzzzzzzzzz boom 
                      </p>
                   </div>
                </footer> */}
              </div>
            </SocketProvider>
          </GameProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
