import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'
import StructuredData, { serviceData } from '@/components/StructuredData'

export const metadata: Metadata = generateMetadata(pageMetadata.services)

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StructuredData data={serviceData} />
      {children}
    </>
  )
}