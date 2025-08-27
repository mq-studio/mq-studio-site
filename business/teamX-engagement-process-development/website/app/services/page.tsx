'use client'

import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const services = [
  {
    id: 'operational-optimization',
    name: 'Operational Optimization',
    description: 'Streamline processes, reduce costs, and improve efficiency across all healthcare operations through data-driven analysis and proven methodologies.',
    icon: CogIcon,
    color: 'from-teamx-navy to-teamx-blue',
    features: [
      'Process Reengineering & Optimization',
      'Cost Reduction & Financial Analysis',
      'Quality Improvement Initiatives',
      'Technology Integration & Automation',
      'Workflow Design & Documentation',
      'Performance Metrics & KPI Development'
    ],
    benefits: [
      'Reduce operational costs by 20-40%',
      'Improve process efficiency by 30-50%',
      'Enhance patient satisfaction scores',
      'Streamline staff workflows'
    ],
    deliverables: [
      'Current State Assessment Report',
      'Future State Process Design',
      'Implementation Roadmap',
      'Change Management Plan',
      'Training Materials & Documentation'
    ]
  },
  {
    id: 'strategic-growth',
    name: 'Strategic Growth Planning',
    description: 'Develop comprehensive growth strategies that align with market opportunities and organizational capabilities for sustainable expansion.',
    icon: ArrowTrendingUpIcon,
    color: 'from-teamx-blue to-teamx-light-blue',
    features: [
      'Market Analysis & Competitive Intelligence',
      'Growth Strategy Development',
      'Competitive Positioning',
      'Revenue Optimization',
      'Market Entry & Expansion Planning',
      'Strategic Partnership Development'
    ],
    benefits: [
      'Identify new revenue opportunities',
      'Achieve sustainable growth rates',
      'Strengthen market position',
      'Optimize resource allocation'
    ],
    deliverables: [
      'Market Analysis Report',
      '3-Year Strategic Plan',
      'Financial Projections',
      'Go-to-Market Strategy',
      'Implementation Timeline'
    ]
  },
  {
    id: 'healthcare-analytics',
    name: 'Healthcare Analytics',
    description: 'Leverage advanced analytics and business intelligence to drive informed decision-making and measurable outcomes.',
    icon: ChartBarIcon,
    color: 'from-teamx-light-blue to-teamx-health-teal',
    features: [
      'Data Analytics & Business Intelligence',
      'Performance Metrics & Dashboards',
      'Predictive Modeling',
      'Population Health Analytics',
      'Financial Performance Analysis',
      'Quality & Outcomes Measurement'
    ],
    benefits: [
      'Improve decision-making accuracy',
      'Identify performance trends',
      'Reduce clinical variations',
      'Optimize resource utilization'
    ],
    deliverables: [
      'Analytics Platform Implementation',
      'Custom Dashboard Development',
      'Predictive Models',
      'Training & User Adoption Plan',
      'Ongoing Analytics Support'
    ]
  },
  {
    id: 'team-development',
    name: 'Team Development',
    description: 'Build high-performing teams through targeted training, leadership development, and organizational culture transformation.',
    icon: UsersIcon,
    color: 'from-teamx-health-teal to-teamx-trust-green',
    features: [
      'Leadership Development Programs',
      'Team Building & Collaboration',
      'Culture Change Management',
      'Performance Management Systems',
      'Succession Planning',
      'Employee Engagement Initiatives'
    ],
    benefits: [
      'Increase employee engagement',
      'Improve leadership effectiveness',
      'Reduce staff turnover',
      'Enhance team collaboration'
    ],
    deliverables: [
      'Leadership Assessment',
      'Development Program Design',
      'Culture Transformation Plan',
      'Performance Management Framework',
      'Ongoing Coaching Support'
    ]
  },
  {
    id: 'compliance-risk',
    name: 'Compliance & Risk Management',
    description: 'Ensure regulatory compliance and implement comprehensive risk management frameworks to protect your organization.',
    icon: ShieldCheckIcon,
    color: 'from-teamx-navy to-teamx-trust-green',
    features: [
      'Regulatory Compliance Assessment',
      'Risk Assessment & Mitigation',
      'Policy Development & Implementation',
      'Audit Preparation & Response',
      'Quality Assurance Programs',
      'Documentation & Training'
    ],
    benefits: [
      'Ensure regulatory compliance',
      'Minimize operational risks',
      'Improve audit outcomes',
      'Protect organizational reputation'
    ],
    deliverables: [
      'Compliance Gap Analysis',
      'Risk Management Framework',
      'Policy & Procedure Manual',
      'Audit Readiness Plan',
      'Staff Training Program'
    ]
  },
  {
    id: 'patient-experience',
    name: 'Patient Experience Enhancement',
    description: 'Improve patient satisfaction and outcomes through service design, workflow optimization, and experience mapping.',
    icon: HeartIcon,
    color: 'from-teamx-blue to-teamx-health-teal',
    features: [
      'Patient Journey Mapping',
      'Service Design & Optimization',
      'Experience Measurement',
      'Staff Training & Development',
      'Technology Enhancement',
      'Communication Improvement'
    ],
    benefits: [
      'Increase patient satisfaction scores',
      'Improve patient outcomes',
      'Enhance reputation & referrals',
      'Reduce patient complaints'
    ],
    deliverables: [
      'Patient Experience Assessment',
      'Journey Map & Pain Points',
      'Service Improvement Plan',
      'Staff Training Materials',
      'Measurement & Monitoring System'
    ]
  }
]

const processSteps = [
  { step: 1, title: 'Discovery', description: 'Comprehensive assessment of current state' },
  { step: 2, title: 'Strategy', description: 'Collaborative solution development' },
  { step: 3, title: 'Implementation', description: 'Hands-on execution and monitoring' },
  { step: 4, title: 'Optimization', description: 'Continuous improvement and support' }
]

export default function Services() {
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
            Our Services
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            Comprehensive healthcare consulting services designed to transform your organization 
            and drive sustainable value creation across all operational areas.
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-24">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`grid lg:grid-cols-2 gap-16 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} mb-6 shadow-lg`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl mb-4">
                    {service.name}
                  </h2>
                  
                  <p className="text-lg text-teamx-warm-gray mb-8 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-teamx-charcoal mb-4">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                          className="flex items-start space-x-2"
                        >
                          <CheckIcon className="h-5 w-5 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                          <span className="text-teamx-slate text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
                  >
                    Learn More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </motion.a>
                </div>

                {/* Benefits & Deliverables Card */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft">
                    <div className="space-y-8">
                      {/* Benefits */}
                      <div>
                        <h3 className="text-xl font-semibold text-teamx-charcoal mb-4">Expected Benefits</h3>
                        <ul className="space-y-2">
                          {service.benefits.map((benefit, benefitIndex) => (
                            <motion.li
                              key={benefit}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: benefitIndex * 0.05 }}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-teamx-trust-green mt-2 flex-shrink-0" />
                              <span className="text-teamx-warm-gray">{benefit}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <h3 className="text-xl font-semibold text-teamx-charcoal mb-4">Key Deliverables</h3>
                        <ul className="space-y-2">
                          {service.deliverables.map((deliverable, deliverableIndex) => (
                            <motion.li
                              key={deliverable}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: deliverableIndex * 0.05 }}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-2 h-2 rounded-full bg-teamx-blue mt-2 flex-shrink-0" />
                              <span className="text-teamx-warm-gray">{deliverable}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-to-br from-teamx-navy to-teamx-blue text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">Our Proven Process</h2>
            <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
              Every engagement follows our structured methodology to ensure consistent, high-quality results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-teamx-accent-blue">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-blue-200">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-6 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Schedule a complimentary consultation to discuss how our services can transform 
              your healthcare organization.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Schedule Consultation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/process"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy border-2 border-teamx-navy rounded-xl hover:bg-teamx-navy hover:text-white transition-all duration-200"
              >
                Learn About Our Process
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}