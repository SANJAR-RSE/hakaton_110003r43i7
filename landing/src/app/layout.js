import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });

export const metadata = {
  title: 'MedQueue Tashkent — Navbatda vaqt yo\'qotmang',
  description:
    "Shifokorga oldindan navbat oling, navbatingizni real vaqtda kuzating, Telegram orqali xabar oling va tibbiy tarixingizni bitta joyda saqlang.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${inter.variable} antialiased`}>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
