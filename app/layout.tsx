import type { Metadata } from 'next'
import { Montserrat, Lora } from 'next/font/google'
import './globals.css'
import WatercolorTexture from '@/components/effects/WatercolorTexture'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['500', '600', '700'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'MQ Studio - Moura Quayle | Feeling, Thinking, Doing',
  description: 'Academia, Leadership, and Design converge in Moura Quayle\'s digital studio. Explore academic publications, watercolor art, and reflections on governance and design.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lora.variable} font-lora antialiased`}>
        <WatercolorTexture />
        {children}
      </body>
    </html>
  )
}