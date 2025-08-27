'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  UsersIcon,
  CursorArrowRaysIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'

const caseStudies = [
  {
    id: 'regional-health-transformation',
    title: 'Regional Health System Transformation',
    client: 'MidAtlantic Regional Health',
    industry: 'Multi-Specialty Health System',
    size: '4 Hospitals, 25 Clinics, 3,500 Staff',
    challenge: 'Rising operational costs, declining patient satisfaction, and fragmented care coordination across multiple facilities threatened the organization\'s financial stability and market position.',
    solution: 'Comprehensive operational transformation including process reengineering, technology integration, and staff development across all facilities.',
    timeline: '18 months',
    icon: BuildingOffice2Icon,
    color: 'from-teamx-navy to-teamx-blue',
    beforeMetrics: {
      operatingMargin: '-2.4%',
      patientSatisfaction: '68%',
      staffTurnover: '24%',
      avgLengthOfStay: '4.2 days',
      costPerCase: '$12,400'
    },
    afterMetrics: {
      operatingMargin: '8.6%',
      patientSatisfaction: '87%',
      staffTurnover: '11%',
      avgLengthOfStay: '3.1 days',
      costPerCase: '$8,900'
    },
    keyResults: [
      '$12.2M annual cost savings achieved',
      '35% reduction in operational costs',
      '40% improvement in process efficiency',
      '19% increase in patient satisfaction scores',
      '13% reduction in staff turnover',
      '26% reduction in average length of stay'
    ],
    implementation: [
      { phase: 'Assessment & Planning', duration: '3 months', description: 'Comprehensive current state analysis and future state design' },
      { phase: 'Process Optimization', duration: '6 months', description: 'Workflow redesign and technology implementation' },
      { phase: 'Staff Training', duration: '4 months', description: 'Change management and skills development' },
      { phase: 'Monitoring & Optimization', duration: '5 months', description: 'Performance tracking and continuous improvement' }
    ],
    testimonial: {
      quote: "TeamX didn't just consult with us - they partnered with us through every step of our transformation. The results speak for themselves, but what impressed me most was their commitment to ensuring our staff could sustain these improvements long-term.",
      author: "Dr. Sarah Mitchell",
      title: "Chief Executive Officer",
      organization: "MidAtlantic Regional Health"
    },
    roi: {
      investment: '$850,000',
      firstYearSavings: '$12,200,000',
      roi: '1,335%',
      paybackPeriod: '2.1 months'
    }
  },
  {
    id: 'specialty-clinic-growth',
    title: 'Specialty Clinic Network Expansion',
    client: 'Advanced Cardiac Care Partners',
    industry: 'Specialty Care Network',
    size: '8 Locations, 150 Providers, 1,200 Staff',
    challenge: 'Market saturation in core geography limited growth opportunities while maintaining quality standards across dispersed locations proved increasingly difficult.',
    solution: 'Strategic market expansion with standardized operations, technology integration, and provider development programs to maintain care quality at scale.',
    timeline: '24 months',
    icon: HeartIcon,
    color: 'from-teamx-blue to-teamx-health-teal',
    beforeMetrics: {
      locations: '5',
      annualRevenue: '$28M',
      patientVolume: '18,500',
      marketShare: '12%',
      providerSatisfaction: '71%'
    },
    afterMetrics: {
      locations: '12',
      annualRevenue: '$46M',
      patientVolume: '31,000',
      marketShare: '19%',
      providerSatisfaction: '89%'
    },
    keyResults: [
      '65% increase in annual revenue',
      '12 new clinic locations opened',
      '68% growth in patient volume',
      '7% increase in market share',
      '18% improvement in provider satisfaction',
      'Achieved 95% quality score consistency across all locations'
    ],
    implementation: [
      { phase: 'Market Analysis', duration: '2 months', description: 'Geographic and demographic analysis for expansion opportunities' },
      { phase: 'Site Development', duration: '12 months', description: 'New location setup and technology integration' },
      { phase: 'Provider Recruitment', duration: '8 months', description: 'Specialist hiring and onboarding programs' },
      { phase: 'Operations Standardization', duration: '6 months', description: 'Process standardization and quality assurance' }
    ],
    testimonial: {
      quote: "The systematic approach TeamX brought to our expansion was remarkable. They helped us grow rapidly while actually improving our quality metrics - something we thought was impossible.",
      author: "Dr. Michael Rodriguez",
      title: "Chief Medical Officer",
      organization: "Advanced Cardiac Care Partners"
    },
    roi: {
      investment: '$2,100,000',
      firstYearSavings: '$18,000,000',
      roi: '757%',
      paybackPeriod: '4.2 months'
    }
  },
  {
    id: 'academic-analytics',
    title: 'Academic Medical Center Analytics Platform',
    client: 'University Medical Center',
    industry: 'Academic Medical Center',
    size: '1,200 Beds, 8,500 Staff, 45 Departments',
    challenge: 'Lack of integrated data analytics limited evidence-based decision making, research capabilities, and operational optimization across the complex academic medical environment.',
    solution: 'Implementation of comprehensive analytics platform with predictive modeling, real-time dashboards, and automated reporting for clinical, operational, and research applications.',
    timeline: '12 months',
    icon: AcademicCapIcon,
    color: 'from-teamx-health-teal to-teamx-trust-green',
    beforeMetrics: {
      dataIntegration: '35%',
      decisionLatency: '14 days',
      researchEfficiency: '42%',
      qualityMetrics: '67%',
      costPerCase: '$18,200'
    },
    afterMetrics: {
      dataIntegration: '95%',
      decisionLatency: '2 hours',
      researchEfficiency: '89%',
      qualityMetrics: '94%',
      costPerCase: '$14,200'
    },
    keyResults: [
      '1,200+ automated insights generated weekly',
      '90% faster decision-making process',
      '47% improvement in research efficiency',
      '27% increase in quality metric scores',
      '22% reduction in cost per case',
      '$8.5M annual savings from optimized operations'
    ],
    implementation: [
      { phase: 'Data Architecture', duration: '3 months', description: 'Integration of disparate data sources and infrastructure setup' },
      { phase: 'Analytics Development', duration: '4 months', description: 'Custom dashboard and predictive model creation' },
      { phase: 'User Training', duration: '2 months', description: 'Staff training and change management' },
      { phase: 'Optimization', duration: '3 months', description: 'Model refinement and performance optimization' }
    ],
    testimonial: {
      quote: "The analytics platform has transformed how we operate. We now make decisions based on real-time data rather than intuition, and our research capabilities have expanded dramatically.",
      author: "Dr. Jennifer Walsh",
      title: "Chief Information Officer",
      organization: "University Medical Center"
    },
    roi: {
      investment: '$1,200,000',
      firstYearSavings: '$8,500,000',
      roi: '608%',
      paybackPeriod: '5.1 months'
    }
  },
  {
    id: 'rural-hospital-optimization',
    title: 'Rural Hospital Network Optimization',
    client: 'Prairie Health Network',
    industry: 'Rural Health System',
    size: '6 Hospitals, 18 Clinics, 900 Staff',
    challenge: 'Financial pressures, physician recruitment challenges, and limited resources threatened the sustainability of critical healthcare services in underserved rural communities.',
    solution: 'Comprehensive sustainability strategy including service line optimization, telemedicine integration, shared services implementation, and physician retention programs.',
    timeline: '15 months',
    icon: UsersIcon,
    color: 'from-teamx-trust-green to-teamx-navy',
    beforeMetrics: {
      operatingMargin: '-8.2%',
      physicianVacancy: '28%',
      patientOutmigration: '45%',
      serviceLines: '12',
      telemedicineUse: '5%'
    },
    afterMetrics: {
      operatingMargin: '3.4%',
      physicianVacancy: '12%',
      patientOutmigration: '22%',
      serviceLines: '18',
      telemedicineUse: '68%'
    },
    keyResults: [
      '11.6% improvement in operating margin',
      '16% reduction in physician vacancy rates',
      '23% decrease in patient outmigration',
      '6 new service lines established',
      '63% increase in telemedicine utilization',
      '$4.2M in annual cost savings achieved'
    ],
    implementation: [
      { phase: 'Sustainability Analysis', duration: '2 months', description: 'Financial and operational viability assessment' },
      { phase: 'Service Optimization', duration: '6 months', description: 'Service line analysis and telemedicine implementation' },
      { phase: 'Physician Recruitment', duration: '4 months', description: 'Recruitment and retention program development' },
      { phase: 'Shared Services', duration: '3 months', description: 'Administrative consolidation and efficiency programs' }
    ],
    testimonial: {
      quote: "TeamX understood the unique challenges facing rural healthcare and developed solutions that worked for our communities. They helped us not just survive, but thrive and better serve our patients.",
      author: "Robert Kim",
      title: "Chief Executive Officer",
      organization: "Prairie Health Network"
    },
    roi: {
      investment: '$680,000',
      firstYearSavings: '$4,200,000',
      roi: '518%',
      paybackPeriod: '5.8 months'
    }
  }
]

const testimonials = [
  {
    quote: "Working with TeamX was transformative for our organization. Their deep healthcare expertise and practical approach delivered results that exceeded our expectations.",
    author: "Dr. Lisa Chen",
    title: "Chief Operating Officer",
    organization: "Metropolitan Healthcare System",
    rating: 5
  },
  {
    quote: "The ROI on our engagement with TeamX was exceptional. They didn't just identify problems - they implemented sustainable solutions that continue to deliver value.",
    author: "Mark Thompson",
    title: "Chief Financial Officer",
    organization: "Riverside Medical Group",
    rating: 5
  },
  {
    quote: "TeamX's data-driven approach and change management expertise made our transformation smooth and successful. Highly recommended for any healthcare organization.",
    author: "Dr. Patricia Williams",
    title: "Chief Medical Officer",
    organization: "Community Health Partners",
    rating: 5
  }
]

export default function CaseStudies() {
  const [selectedCase, setSelectedCase] = useState(caseStudies[0])
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8 py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-teamx-charcoal sm:text-6xl">
            Case Studies
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            Discover how TeamX has helped healthcare organizations achieve transformational 
            results through strategic consulting and operational excellence.
          </p>
        </motion.div>
      </section>

      {/* Case Study Selector */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseStudies.map((caseStudy, index) => (
              <motion.button
                key={caseStudy.id}
                onClick={() => setSelectedCase(caseStudy)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-6 rounded-2xl text-left transition-all duration-300 ${
                  selectedCase.id === caseStudy.id
                    ? 'bg-gradient-primary text-white shadow-professional'
                    : 'bg-teamx-background hover:bg-gradient-to-br hover:from-slate-100 hover:to-blue-100 shadow-soft'
                }`}
              >
                <caseStudy.icon className={`h-8 w-8 mb-3 ${
                  selectedCase.id === caseStudy.id ? 'text-white' : 'text-teamx-navy'
                }`} />
                <h3 className={`font-semibold mb-2 ${
                  selectedCase.id === caseStudy.id ? 'text-white' : 'text-teamx-charcoal'
                }`}>
                  {caseStudy.title}
                </h3>
                <p className={`text-sm ${
                  selectedCase.id === caseStudy.id ? 'text-blue-100' : 'text-teamx-warm-gray'
                }`}>
                  {caseStudy.industry}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Case Study Details */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Case Study Header */}
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCase.color} shadow-lg`}>
                    <selectedCase.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
                      {selectedCase.title}
                    </h2>
                    <p className="text-lg text-teamx-warm-gray">
                      {selectedCase.client} • {selectedCase.industry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm text-teamx-warm-gray">
                  <span className="flex items-center">
                    <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                    {selectedCase.size}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {selectedCase.timeline}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="bg-gradient-to-br from-teamx-trust-green/10 to-teamx-health-teal/10 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-teamx-trust-green">
                    {selectedCase.roi.roi}
                  </div>
                  <div className="text-sm text-teamx-warm-gray">ROI Achieved</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'results', label: 'Results' },
                  { id: 'implementation', label: 'Implementation' },
                  { id: 'testimonial', label: 'Testimonial' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-teamx-navy text-teamx-navy'
                        : 'border-transparent text-teamx-warm-gray hover:text-teamx-charcoal hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold text-teamx-charcoal mb-4">The Challenge</h3>
                      <p className="text-teamx-warm-gray leading-relaxed">
                        {selectedCase.challenge}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-teamx-charcoal mb-4">Our Solution</h3>
                      <p className="text-teamx-warm-gray leading-relaxed">
                        {selectedCase.solution}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft">
                    <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Key Metrics</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-teamx-charcoal mb-2">Before Engagement</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedCase.beforeMetrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm text-teamx-warm-gray capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                              <span className="text-sm font-semibold text-red-600">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <hr className="border-gray-200" />

                      <div>
                        <h4 className="font-medium text-teamx-charcoal mb-2">After Implementation</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedCase.afterMetrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm text-teamx-warm-gray capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                              <span className="text-sm font-semibold text-teamx-trust-green">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Key Results Achieved</h3>
                  <div className="space-y-4">
                    {selectedCase.keyResults.map((result, index) => (
                      <motion.div
                        key={result}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircleIcon className="h-6 w-6 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                        <span className="text-teamx-warm-gray">{result}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Financial Impact</h3>
                  <div className="bg-gradient-to-br from-teamx-trust-green/10 to-teamx-health-teal/10 p-8 rounded-3xl">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teamx-trust-green">
                          {selectedCase.roi.firstYearSavings}
                        </div>
                        <div className="text-sm text-teamx-warm-gray">First Year Savings</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teamx-navy">
                          {selectedCase.roi.roi}
                        </div>
                        <div className="text-sm text-teamx-warm-gray">Return on Investment</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teamx-health-teal">
                          {selectedCase.roi.investment}
                        </div>
                        <div className="text-sm text-teamx-warm-gray">Total Investment</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teamx-blue">
                          {selectedCase.roi.paybackPeriod}
                        </div>
                        <div className="text-sm text-teamx-warm-gray">Payback Period</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'implementation' && (
              <div>
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Implementation Timeline</h3>
                <div className="space-y-6">
                  {selectedCase.implementation.map((phase, index) => (
                    <motion.div
                      key={phase.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex items-start space-x-6 p-6 bg-gradient-to-r from-teamx-background to-white rounded-2xl border border-gray-100"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-teamx-charcoal">
                            {phase.phase}
                          </h4>
                          <span className="text-sm text-teamx-warm-gray bg-teamx-background px-3 py-1 rounded-full">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="text-teamx-warm-gray">
                          {phase.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonial' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-12 rounded-3xl shadow-soft text-center">
                  <ChatBubbleBottomCenterTextIcon className="h-12 w-12 text-teamx-navy mx-auto mb-6" />
                  
                  <blockquote className="text-xl text-teamx-charcoal leading-relaxed mb-8 italic">
                    &ldquo;{selectedCase.testimonial.quote}&rdquo;
                  </blockquote>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="text-lg font-semibold text-teamx-charcoal">
                      {selectedCase.testimonial.author}
                    </div>
                    <div className="text-teamx-warm-gray">
                      {selectedCase.testimonial.title}
                    </div>
                    <div className="text-teamx-navy font-medium">
                      {selectedCase.testimonial.organization}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Additional Testimonials */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              What Our Clients Say
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Hear from healthcare leaders who have partnered with TeamX to achieve transformational results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-teamx-warm-gray mb-6 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="font-semibold text-teamx-charcoal">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-teamx-warm-gray">
                    {testimonial.title}
                  </div>
                  <div className="text-sm text-teamx-navy">
                    {testimonial.organization}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-teamx-navy to-teamx-blue text-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Achieve Similar Results?
            </h2>
            <p className="mt-6 text-lg text-blue-200 max-w-2xl mx-auto">
              Join the growing number of healthcare organizations that have transformed 
              their operations with TeamX&apos;s proven methodologies and expert guidance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Start Your Transformation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/resources"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-teamx-navy transition-all duration-200"
              >
                View Resources
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}