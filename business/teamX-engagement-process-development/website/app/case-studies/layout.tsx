import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateMetadata(pageMetadata['case-studies'])

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}