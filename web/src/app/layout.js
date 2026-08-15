import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata = {
  title: 'MedQueue Tashkent',
  description: 'Navbatda vaqt yo\'qotmang. Shifokorga oldindan navbat oling, navbatingizni kuzating va tibbiy tarixingizni bitta joyda saqlang.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
