import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voetbalapp',
  description: 'Mobile-first voetbalapp MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
