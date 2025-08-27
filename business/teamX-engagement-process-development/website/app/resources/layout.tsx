import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata.resources)

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}