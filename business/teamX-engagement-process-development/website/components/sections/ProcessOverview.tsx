'use client'

import { motion } from 'framer-motion'
import { CheckCircleIcon, ClockIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const processSteps = [
  {
    id: 1,
    title: 'Discovery & Assessment',
    description: 'Comprehensive analysis of your healthcare organization\'s current operations, identifying opportunities and challenges.',
    icon: ChartBarIcon,
    duration: '2-4 weeks',
    color: 'from-teamx-navy to-teamx-blue'
  },
  {
    id: 2,
    title: 'Strategic Planning',
    description: 'Collaborative development of tailored solutions and implementation roadmaps aligned with your organizational goals.',
    icon: UserGroupIcon,
    duration: '3-5 weeks',
    color: 'from-teamx-blue to-teamx-light-blue'
  },
  {
    id: 3,
    title: 'Implementation',
    description: 'Hands-on execution of strategic initiatives with continuous monitoring and adjustment for optimal results.',
    icon: ClockIcon,
    duration: '6-12 weeks',
    color: 'from-teamx-light-blue to-teamx-health-teal'
  },
  {
    id: 4,
    title: 'Optimization & Growth',
    description: 'Ongoing support and refinement to ensure sustainable improvements and long-term value creation.',
    icon: CheckCircleIcon,
    duration: 'Ongoing',
    color: 'from-teamx-health-teal to-teamx-trust-green'
  }
]

export default function ProcessOverview() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-teamx-blue">Our Process</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Proven Engagement Methodology
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            Our structured approach ensures measurable results through every phase of your healthcare transformation journey.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-6xl">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-teamx-navy via-teamx-blue to-teamx-trust-green opacity-30 lg:block hidden" />
            
            <div className="space-y-12 lg:space-y-20">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } flex-col lg:space-x-12`}
                >
                  {/* Content */}
                  <div className="flex-1 max-w-md">
                    <div className={`rounded-2xl bg-white p-8 shadow-soft border border-slate-100 hover:shadow-professional transition-all duration-300 ${
                      index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'
                    } text-center`}>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} mb-6`}>
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">
                        {step.title}
                      </h3>
                      <p className="text-teamx-warm-gray mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-sm text-teamx-slate font-medium">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {step.duration}
                      </div>
                    </div>
                  </div>

                  {/* Timeline indicator */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 lg:flex-shrink-0 my-8 lg:my-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {step.id}
                    </motion.div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 max-w-md lg:block hidden" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
          >
            Start Your Transformation
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}