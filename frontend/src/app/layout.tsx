import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import Sidebar from '@/components/sidebar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body style={{ margin: 0, padding: 0, background: '#0b0f1a', color: '#e2e8f0', fontFamily: 'var(--fx-font-sans)' }}>
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
