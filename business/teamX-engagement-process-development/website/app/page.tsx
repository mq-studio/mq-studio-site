import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import ProcessOverview from '@/components/sections/ProcessOverview'
import CaseStudiesPreview from '@/components/sections/CaseStudiesPreview'
import Team from '@/components/sections/Team'
import Testimonials from '@/components/sections/Testimonials'
import About from '@/components/sections/About'
import CTABanner from '@/components/sections/CTABanner'
import Contact from '@/components/sections/Contact'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <ProcessOverview />
      <CaseStudiesPreview />
      <Team />
      <Testimonials />
      <About />
      <CTABanner />
      <Contact />
    </main>
  )
}