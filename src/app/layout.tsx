import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tramuntana — DeFi Yield & Trading',
  description: 'Non-custodial DeFi yield and perpetuals trading. Earn yield in audited vaults. Trade perps on Hyperliquid.',
  keywords: ['DeFi', 'yield', 'trading', 'Hyperliquid', 'non-custodial', 'USDC', 'BTC'],
  authors: [{ name: 'Tramuntana' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tramuntana',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
