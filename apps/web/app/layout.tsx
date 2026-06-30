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
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://humandynamics.guide';
const OG_IMAGE = '/og-image.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'A Field Guide to Being Human',
  description:
    'Stories from history, epics, and real life to navigate workplace dynamics, relationships, and hard decisions.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Field Guide',
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
    title: 'A Field Guide to Being Human',
    description:
      'Stories to navigate difficult bosses, unfair promotions, and hard decisions.',
    url: SITE_URL,
    siteName: 'A Field Guide to Being Human',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'A Field Guide to Being Human' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Field Guide to Being Human',
    description:
      'Stories to navigate difficult bosses, unfair promotions, and hard decisions.',
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: '#DAA520',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={ibmPlexSans.variable}>
      <body>
        <ServiceWorkerRegister />
        <ThemeProvider>
          <ThemeToggle />
          <ShareStoryButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
