'use client'

import { useState } from 'react'
import { EyeIcon, ArrowDownTrayIcon, ChartBarIcon, CogIcon, UsersIcon, ShareIcon } from '@heroicons/react/24/outline'

interface FrameworkGalleryProps {
  onFrameworkSelect: (frameworkId: string) => void
}

const frameworks = [
  {
    id: 'integrated-master-framework',
    title: 'Integrated Master Framework',
    description: 'Complete system architecture combining all four pillars of healthcare scaling excellence.',
    category: 'Master Framework',
    icon: <ChartBarIcon className="h-8 w-8" />,
    features: ['60/40 Clinical Model', '$18M Revenue Target', '12+ Locations', '24-Month Timeline'],
    color: 'bg-gradient-to-br from-blue-500 to-blue-700',
    stats: { locations: '12+', revenue: '$18M', efficiency: '+167%' }
  },
  {
    id: 'operational-alpha-canvas',
    title: 'Operational Alpha™ Canvas',
    description: 'Healthcare automation architecture designed to achieve operational excellence.',
    category: 'Operations',
    icon: <CogIcon className="h-8 w-8" />,
    features: ['40% → 85% Automation', '$380K/yr Savings', '+35% Capacity', '2.5 hrs/day AI Savings'],
    color: 'bg-gradient-to-br from-purple-500 to-purple-700',
    stats: { automation: '85%', savings: '$380K', capacity: '+35%' }
  },
  {
    id: 'realtime-value-dashboard',
    title: 'Real-time Value Dashboard',
    description: 'Live performance tracking and KPI monitoring for healthcare networks.',
    category: 'Analytics',
    icon: <ChartBarIcon className="h-8 w-8" />,
    features: ['Real-time KPIs', 'Predictive Analytics', 'ROI Tracking', 'Performance Alerts'],
    color: 'bg-gradient-to-br from-green-500 to-green-700',
    stats: { metrics: '50+', uptime: '99.9%', insights: 'Real-time' }
  },
  {
    id: 'network-effects-canvas',
    title: 'Network Effects Canvas',
    description: 'Scalable network value creation and amplification strategies.',
    category: 'Growth',
    icon: <ShareIcon className="h-8 w-8" />,
    features: ['n² Value Creation', '25,000+ Patients', '$42M Network Value', '27:1 LTV:CAC'],
    color: 'bg-gradient-to-br from-teal-500 to-teal-700',
    stats: { patients: '25K+', value: '$42M', ratio: '27:1' }
  },
  {
    id: 'data-capital-framework',
    title: 'Data Capital Framework',
    description: 'Data monetization strategies and value extraction methodologies.',
    category: 'Data Strategy',
    icon: <ChartBarIcon className="h-8 w-8" />,
    features: ['$2M+ Data Revenue', 'Predictive Models', 'Privacy-First', 'API Monetization'],
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
    stats: { revenue: '$2M+', models: '15+', accuracy: '94%' }
  },
  {
    id: 'talent-as-product-canvas',
    title: 'Talent-as-Product Canvas',
    description: 'Comprehensive talent development and pipeline management system.',
    category: 'Talent',
    icon: <UsersIcon className="h-8 w-8" />,
    features: ['40/30/20/10 Model', '500/yr Pipeline', '85% Retention', '$2.1M Revenue'],
    color: 'bg-gradient-to-br from-orange-500 to-orange-700',
    stats: { pipeline: '500/yr', retention: '85%', revenue: '$2.1M' }
  }
]

const categories = ['All', 'Master Framework', 'Operations', 'Analytics', 'Growth', 'Data Strategy', 'Talent']

export default function FrameworkGallery({ onFrameworkSelect }: FrameworkGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [hoveredFramework, setHoveredFramework] = useState<string | null>(null)

  const filteredFrameworks = selectedCategory === 'All' 
    ? frameworks 
    : frameworks.filter(framework => framework.category === selectedCategory)

  const handleDownload = (frameworkId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const framework = frameworks.find(f => f.id === frameworkId)
    if (framework) {
      const link = document.createElement('a')
      link.href = `/frameworks/${frameworkId}.html`
      link.download = `${frameworkId}.html`
      link.click()
    }
  }

  return (
    <section className="py-16 bg-teamx-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-teamx-charcoal mb-4">
            Framework Gallery
          </h2>
          <p className="text-lg text-teamx-slate max-w-2xl mx-auto">
            Interactive strategic frameworks designed to transform healthcare operations and drive scalable growth.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-teamx-navy text-white'
                  : 'bg-white text-teamx-slate hover:bg-teamx-navy hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Framework Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFrameworks.map((framework) => (
            <div
              key={framework.id}
              className="bg-white rounded-xl shadow-soft hover:shadow-professional transition-all duration-300 cursor-pointer group overflow-hidden"
              onMouseEnter={() => setHoveredFramework(framework.id)}
              onMouseLeave={() => setHoveredFramework(null)}
              onClick={() => onFrameworkSelect(framework.id)}
            >
              {/* Framework Header */}
              <div className={`${framework.color} text-white p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {framework.icon}
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      {framework.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{framework.title}</h3>
                  <p className="text-white/90 text-sm">{framework.description}</p>
                </div>
              </div>

              {/* Framework Content */}
              <div className="p-6">
                {/* Key Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-teamx-charcoal mb-3">Key Features</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {framework.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-teamx-slate">
                        <div className="w-1.5 h-1.5 bg-teamx-trust-green rounded-full mr-2 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-teamx-background rounded-lg">
                  {Object.entries(framework.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-teamx-charcoal">{value}</div>
                      <div className="text-xs text-teamx-slate capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onFrameworkSelect(framework.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-teamx-navy text-white rounded-lg hover:bg-teamx-navy/90 transition-colors text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View Framework
                  </button>
                  <button
                    onClick={(e) => handleDownload(framework.id, e)}
                    className="p-2 border border-teamx-navy text-teamx-navy rounded-lg hover:bg-teamx-navy hover:text-white transition-colors"
                    title="Download Framework"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hover Overlay */}
              {hoveredFramework === framework.id && (
                <div className="absolute inset-0 bg-teamx-navy/5 pointer-events-none transition-opacity duration-300"></div>
              )}
            </div>
          ))}
        </div>

        {/* Framework Benefits */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-soft">
          <h3 className="text-2xl font-bold text-teamx-charcoal mb-6 text-center">
            Why Our Frameworks Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-teamx-trust-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-6 w-6 text-teamx-trust-green" />
              </div>
              <h4 className="font-semibold text-teamx-charcoal mb-2">Evidence-Based</h4>
              <p className="text-teamx-slate text-sm">
                Built from real clinic data and validated through multiple successful implementations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teamx-trust-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CogIcon className="h-6 w-6 text-teamx-trust-green" />
              </div>
              <h4 className="font-semibold text-teamx-charcoal mb-2">Systematic</h4>
              <p className="text-teamx-slate text-sm">
                Comprehensive methodology covering every aspect of healthcare service scaling.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teamx-trust-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-6 w-6 text-teamx-trust-green" />
              </div>
              <h4 className="font-semibold text-teamx-charcoal mb-2">Scalable</h4>
              <p className="text-teamx-slate text-sm">
                Designed to grow with your organization from single clinic to multi-province network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}