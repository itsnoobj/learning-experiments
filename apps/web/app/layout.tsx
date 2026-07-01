import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider } from './theme-provider';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { ShareStoryButton } from '@/shared/components/ShareStoryButton';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

// OG image: a real 1200x630 PNG (`/og-image.png`) is the primary image since
// most social platforms (Facebook, LinkedIn, iMessage, WhatsApp, Slack) do NOT
// render SVG previews. The PNG was generated from `/og-image.svg` via:
//   rsvg-convert -w 1200 -h 630 public/og-image.svg -o public/og-image.png
// Regenerate the PNG after editing the SVG so the two stay in sync.
import { SITE_URL, SITE_NAME } from '@/lib/seo';

const OG_IMAGE = '/og-image.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description:
    'Stories from history, epics, and real life to navigate workplace dynamics, relationships, and hard decisions.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Human Dynamics',
  },
  icons: {
    apple: '/icon-192.png',
  },
  other: {
    // Explicit legacy apple tag for older iOS Safari. Next emits the modern
    // `mobile-web-app-capable` from appleWebApp.capable; this adds the apple-prefixed one.
    'apple-mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: SITE_NAME,
    description: 'Stories to navigate difficult bosses, unfair promotions, and hard decisions.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: 'Stories to navigate difficult bosses, unfair promotions, and hard decisions.',
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: '#DAA520',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={ibmPlexSans.variable} suppressHydrationWarning>
      <body>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <nav
            style={{
              position: 'fixed',
              top: '1rem',
              right: '6.5rem',
              zIndex: 50,
            }}
          >
            <Link
              href="/why"
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-dim)',
                textDecoration: 'none',
                padding: '0.4rem 0.7rem',
                border: '1px solid var(--color-border)',
                borderRadius: '9999px',
                background: 'var(--color-surface)',
                whiteSpace: 'nowrap',
              }}
            >
              Why this?
            </Link>
          </nav>
          <ThemeToggle />
          <ShareStoryButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
