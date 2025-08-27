import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata.investors)

export default function InvestorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}