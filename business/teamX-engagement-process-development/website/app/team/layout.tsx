import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata.team)

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}