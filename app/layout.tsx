import type { Metadata, Viewport } from 'next';
import { Fraunces, Jost } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces'
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-jost'
});

export const metadata: Metadata = {
  title: 'Beyond The Body — Coming Soon',
  description: 'Beyond The Body — a new chapter in fine fragrance. Launching soon.',
  openGraph: {
    title: 'Beyond The Body — Coming Soon',
    description: 'A new chapter in fine fragrance. Launching soon.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond The Body — Coming Soon',
    description: 'A new chapter in fine fragrance. Launching soon.'
  },
  icons: { icon: '/favicon.svg' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3a1620'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
