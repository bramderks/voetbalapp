import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voetbalapp",
  description: "SCE JO8-1 teambeheer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-white text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
