import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant'
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-jost'
});

export const metadata: Metadata = {
  title: 'Beyond the Body — Coming Soon',
  description: 'The Art of Attraction. A new chapter in fine fragrance. Launching soon.',
  openGraph: {
    title: 'Beyond the Body — Coming Soon',
    description: 'The Art of Attraction. A new chapter in fine fragrance.',
    type: 'website',
    images: ['/hero.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond the Body — Coming Soon',
    description: 'The Art of Attraction. A new chapter in fine fragrance.',
    images: ['/hero.jpg']
  },
  icons: { icon: '/favicon.svg' }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a0609'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  );
}
