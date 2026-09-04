import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import Sidebar from '@/components/sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'FX Journal — Personal FOREX Trading Journal',
  description: 'Track and analyze your FOREX trades. Win rate, profit factor, R:R, pairs breakdown and more.',
  keywords: ['forex', 'trading journal', 'fx trader', 'trade tracker'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0b0f1a', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, minHeight: '100vh', background: '#0b0f1a', overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
