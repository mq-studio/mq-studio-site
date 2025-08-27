'use client'

import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'

const services = [
  {
    name: 'Operational Optimization',
    description:
      'Streamline processes, reduce costs, and improve efficiency across all healthcare operations through data-driven analysis and proven methodologies.',
    icon: CogIcon,
    features: ['Process Reengineering', 'Cost Reduction', 'Quality Improvement', 'Technology Integration'],
  },
  {
    name: 'Strategic Growth Planning',
    description:
      'Develop comprehensive growth strategies that align with market opportunities and organizational capabilities for sustainable expansion.',
    icon: ArrowTrendingUpIcon,
    features: ['Market Analysis', 'Growth Strategy', 'Competitive Positioning', 'Revenue Optimization'],
  },
  {
    name: 'Healthcare Analytics',
    description:
      'Leverage advanced analytics and business intelligence to drive informed decision-making and measurable outcomes.',
    icon: ChartBarIcon,
    features: ['Data Analytics', 'Performance Metrics', 'Predictive Modeling', 'Dashboard Development'],
  },
  {
    name: 'Team Development',
    description:
      'Build high-performing teams through targeted training, leadership development, and organizational culture transformation.',
    icon: UsersIcon,
    features: ['Leadership Training', 'Team Building', 'Culture Change', 'Performance Management'],
  },
  {
    name: 'Compliance & Risk Management',
    description:
      'Ensure regulatory compliance and implement comprehensive risk management frameworks to protect your organization.',
    icon: ShieldCheckIcon,
    features: ['Regulatory Compliance', 'Risk Assessment', 'Policy Development', 'Audit Preparation'],
  },
  {
    name: 'Patient Experience Enhancement',
    description:
      'Improve patient satisfaction and outcomes through service design, workflow optimization, and experience mapping.',
    icon: HeartIcon,
    features: ['Patient Journey Mapping', 'Service Design', 'Experience Optimization', 'Satisfaction Improvement'],
  },
]

export default function Services() {
  return (
    <section id="services" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-teamx-navy">Our Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Comprehensive Healthcare Solutions
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            We deliver end-to-end consulting services designed to transform healthcare organizations 
            and drive sustainable value creation across all operational areas.
          </p>
        </motion.div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex flex-col bg-white p-8 rounded-2xl border border-slate-100 shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-lg"
                >
                  <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </motion.div>
                
                <dt className="text-xl font-semibold leading-7 text-teamx-charcoal">
                  {service.name}
                </dt>
                
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-teamx-warm-gray">
                  <p className="flex-auto">{service.description}</p>
                  
                  <div className="mt-6">
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: (index * 0.1) + (featureIndex * 0.1) }}
                          className="flex items-center text-sm text-teamx-slate"
                        >
                          <motion.div
                            whileInView={{ scale: [0, 1.2, 1] }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (index * 0.1) + (featureIndex * 0.1) }}
                            className="h-1.5 w-1.5 rounded-full bg-teamx-trust-green mr-3"
                          />
                          {feature}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 sm:mt-20 lg:mt-24"
        >
          <div className="rounded-2xl bg-teamx-background p-8 ring-1 ring-teamx-light-slate/20">
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="text-2xl font-bold tracking-tight text-teamx-charcoal">
                Ready to Transform Your Organization?
              </h3>
              <p className="mt-4 text-lg leading-8 text-teamx-warm-gray">
                Let&apos;s discuss how our proven methodologies can drive measurable results for your healthcare organization.
              </p>
              <div className="mt-8">
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-professional hover:shadow-lg transition-all duration-200"
                >
                  Schedule a Consultation
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}