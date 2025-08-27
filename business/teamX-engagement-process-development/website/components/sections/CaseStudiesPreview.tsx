'use client'

import { motion } from 'framer-motion'
import { ArrowUpRightIcon, TrendingUpIcon, UsersIcon, DollarSignIcon } from 'lucide-react'

const caseStudies = [
  {
    id: 1,
    title: 'Regional Health System Transformation',
    client: 'Major Healthcare Network',
    category: 'Operational Excellence',
    description: 'Complete operational overhaul resulting in significant cost savings and improved patient satisfaction.',
    metrics: [
      { label: 'Cost Reduction', value: '32%', icon: DollarSignIcon },
      { label: 'Patient Satisfaction', value: '+45%', icon: TrendingUpIcon },
      { label: 'Staff Efficiency', value: '+28%', icon: UsersIcon }
    ],
    image: '/images/case-study-1.jpg',
    timeline: '8 months',
    roi: '285%'
  },
  {
    id: 2,
    title: 'Digital Health Innovation',
    client: 'Specialty Medical Group',
    category: 'Technology Integration',
    description: 'Implementation of cutting-edge digital health solutions and workflow optimization.',
    metrics: [
      { label: 'Processing Speed', value: '+67%', icon: TrendingUpIcon },
      { label: 'Error Reduction', value: '89%', icon: DollarSignIcon },
      { label: 'Provider Adoption', value: '94%', icon: UsersIcon }
    ],
    image: '/images/case-study-2.jpg',
    timeline: '6 months',
    roi: '310%'
  },
  {
    id: 3,
    title: 'Multi-Site Growth Strategy',
    client: 'Healthcare Investment Group',
    category: 'Strategic Growth',
    description: 'Expansion strategy and implementation across 12 new locations with seamless integration.',
    metrics: [
      { label: 'Revenue Growth', value: '+156%', icon: DollarSignIcon },
      { label: 'Market Expansion', value: '12 Sites', icon: TrendingUpIcon },
      { label: 'Team Integration', value: '98%', icon: UsersIcon }
    ],
    image: '/images/case-study-3.jpg',
    timeline: '12 months',
    roi: '420%'
  }
]

export default function CaseStudiesPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-teamx-blue">Success Stories</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Proven Results Across Healthcare
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            Discover how we&apos;ve helped healthcare organizations achieve transformational outcomes and sustainable growth.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft hover:shadow-professional transition-all duration-300"
            >
              {/* Image placeholder with gradient */}
              <div className="aspect-[16/10] bg-gradient-to-br from-teamx-navy via-teamx-blue to-teamx-light-blue relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-teamx-navy">
                    {study.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm font-medium">ROI: {study.roi}</span>
                    <span className="text-sm">{study.timeline}</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-teamx-charcoal group-hover:text-teamx-blue transition-colors duration-200">
                  {study.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-teamx-blue">
                  {study.client}
                </p>
                <p className="mt-3 text-teamx-warm-gray leading-relaxed">
                  {study.description}
                </p>

                {/* Metrics */}
                <div className="mt-6 space-y-3">
                  {study.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <metric.icon className="h-4 w-4 text-teamx-blue" />
                        <span className="text-sm text-teamx-slate">{metric.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-teamx-navy">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <motion.a
                    href="#contact"
                    className="group/cta flex items-center justify-between w-full text-teamx-blue hover:text-teamx-navy transition-colors duration-200"
                    whileHover={{ x: 4 }}
                  >
                    <span className="text-sm font-medium">Learn more about this case</span>
                    <ArrowUpRightIcon className="h-4 w-4 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1 transition-transform duration-200" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-3 text-base font-semibold text-teamx-navy border-2 border-teamx-navy rounded-xl hover:bg-teamx-navy hover:text-white transition-all duration-200"
          >
            View All Case Studies
            <ArrowUpRightIcon className="ml-2 h-4 w-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}