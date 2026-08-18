import type { Metadata } from 'next';
import '../src/index.css';
import { ErrorBoundary } from '../src/components/ErrorBoundary.tsx';
import { Auth0ProviderWithConfig } from '../src/components/Auth0ProviderWithConfig.tsx';
import { ToastProvider } from '../src/components/Toast.tsx';
import { ChunkErrorRecovery } from '../src/components/ChunkErrorRecovery.tsx';

export const metadata: Metadata = {
  title: 'Display & Cell Pros LLC | Bench Repair Portal',
  description:
    'Offline-capable device repair intake, WebUSB diagnostic port monitor, and bench QA portal for Spokane HQ Lab.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'D&CP Repair',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ErrorBoundary>
          <Auth0ProviderWithConfig>
            <ToastProvider>{children}</ToastProvider>
          </Auth0ProviderWithConfig>
        </ErrorBoundary>
        <ChunkErrorRecovery />
      </body>
    </html>
  );
}
