import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata.about)

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}