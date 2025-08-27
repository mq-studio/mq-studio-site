'use client'

import { useState } from 'react'
import FrameworkGallery from '@/components/frameworks/FrameworkGallery'
import FrameworkViewer from '@/components/frameworks/FrameworkViewer'
import PageTransition from '@/components/ui/PageTransition'
import ScrollProgress from '@/components/ui/ScrollProgress'

export default function FrameworksPage() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  return (
    <PageTransition>
      <ScrollProgress />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-primary pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Strategic Frameworks
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Explore our comprehensive suite of frameworks designed to transform naturopathic clinics into scalable healthcare networks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">11</div>
                <div className="text-sm">Strategic Frameworks</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm">Core Pillars</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">$18M</div>
                <div className="text-sm">Revenue Target</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-teamx-charcoal mb-4">
              The TeamX Framework Ecosystem
            </h2>
            <p className="text-lg text-teamx-slate max-w-3xl mx-auto">
              Our frameworks provide a systematic approach to healthcare services scaling, 
              combining clinical excellence with operational efficiency and strategic growth.
            </p>
          </div>

          {/* Four Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-teamx-background rounded-xl">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-lg font-semibold text-teamx-charcoal mb-2">Clinical Excellence</h3>
              <p className="text-teamx-slate text-sm">Standardized protocols and outcomes measurement</p>
            </div>
            <div className="text-center p-6 bg-teamx-background rounded-xl">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-teamx-charcoal mb-2">Operational Alpha™</h3>
              <p className="text-teamx-slate text-sm">Automation and efficiency optimization</p>
            </div>
            <div className="text-center p-6 bg-teamx-background rounded-xl">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-teamx-charcoal mb-2">Talent Ecosystem</h3>
              <p className="text-teamx-slate text-sm">Talent-as-a-Product model and development</p>
            </div>
            <div className="text-center p-6 bg-teamx-background rounded-xl">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-teamx-charcoal mb-2">Network Effects</h3>
              <p className="text-teamx-slate text-sm">Scalable network value creation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Gallery */}
      <FrameworkGallery onFrameworkSelect={setSelectedFramework} />

      {/* Framework Viewer Modal */}
      {selectedFramework && (
        <FrameworkViewer
          frameworkId={selectedFramework}
          onClose={() => setSelectedFramework(null)}
        />
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Clinic?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our frameworks have helped clinics achieve 167% efficiency gains and $18M+ revenue targets.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-teamx-navy font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 hover:scale-105"
          >
            Start Your Transformation
          </a>
        </div>
      </section>
    </PageTransition>
  )
}