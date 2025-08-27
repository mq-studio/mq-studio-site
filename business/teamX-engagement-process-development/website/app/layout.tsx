import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Layout from '@/components/layout/Layout'
import { generateMetadata as genMetadata, pageMetadata } from '@/lib/metadata'
import StructuredData, { organizationData, websiteData } from '@/components/StructuredData'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  ...genMetadata(pageMetadata.home),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://teamx-healthcare.com'),
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className="antialiased bg-teamx-background">
        <StructuredData data={organizationData} />
        <StructuredData data={websiteData} />
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  )
}