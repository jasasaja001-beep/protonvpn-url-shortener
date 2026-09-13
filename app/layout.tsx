import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProtonVPN URL Shortener',
  description: 'URL shortener with click analytics',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id"><body>{children}</body></html>
}
