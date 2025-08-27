import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata.frameworks)

export default function FrameworksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}