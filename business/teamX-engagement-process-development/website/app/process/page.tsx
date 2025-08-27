'use client'

import { motion } from 'framer-motion'
import {
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const processPhases = [
  {
    id: 'discovery',
    phase: 1,
    title: 'Discovery & Assessment',
    duration: '2-4 weeks',
    description: 'Comprehensive analysis of your healthcare organization\'s current operations, identifying opportunities and challenges through data-driven assessment.',
    icon: ChartBarIcon,
    color: 'from-teamx-navy to-teamx-blue',
    activities: [
      'Stakeholder interviews and workshops',
      'Operational process analysis',
      'Financial performance review',
      'Technology systems assessment',
      'Competitive benchmarking',
      'Risk and compliance evaluation'
    ],
    deliverables: [
      'Current State Assessment Report',
      'Gap Analysis & Opportunity Matrix',
      'Stakeholder Engagement Summary',
      'Initial Recommendations Framework'
    ],
    keyFocus: 'Understanding your unique challenges and opportunities',
    outcomes: [
      'Clear visibility into current performance',
      'Identified improvement opportunities',
      'Stakeholder alignment on priorities',
      'Baseline metrics established'
    ]
  },
  {
    id: 'strategy',
    phase: 2,
    title: 'Strategic Planning',
    duration: '3-5 weeks',
    description: 'Collaborative development of tailored solutions and implementation roadmaps aligned with your organizational goals and market realities.',
    icon: UserGroupIcon,
    color: 'from-teamx-blue to-teamx-light-blue',
    activities: [
      'Solution design workshops',
      'Financial modeling and projections',
      'Implementation planning',
      'Change management strategy',
      'Resource allocation planning',
      'Timeline and milestone definition'
    ],
    deliverables: [
      'Strategic Transformation Plan',
      'Implementation Roadmap',
      'Financial Impact Analysis',
      'Change Management Strategy',
      'Resource Requirements Plan'
    ],
    keyFocus: 'Designing solutions that align with your vision and capabilities',
    outcomes: [
      'Clear transformation roadmap',
      'Defined success metrics',
      'Resource allocation plan',
      'Leadership team alignment'
    ]
  },
  {
    id: 'implementation',
    phase: 3,
    title: 'Implementation',
    duration: '6-12 weeks',
    description: 'Hands-on execution of strategic initiatives with continuous monitoring and adjustment for optimal results and sustainable change.',
    icon: CogIcon,
    color: 'from-teamx-light-blue to-teamx-health-teal',
    activities: [
      'Project execution and oversight',
      'Team training and development',
      'Process implementation',
      'Technology deployment',
      'Performance monitoring',
      'Continuous improvement cycles'
    ],
    deliverables: [
      'Implemented Solutions',
      'Training Materials & Programs',
      'Updated Policies & Procedures',
      'Performance Dashboards',
      'Progress Reports'
    ],
    keyFocus: 'Executing solutions with minimal disruption to operations',
    outcomes: [
      'Operational improvements realized',
      'Teams trained and empowered',
      'New processes functioning',
      'Early results achieved'
    ]
  },
  {
    id: 'optimization',
    phase: 4,
    title: 'Optimization & Growth',
    duration: 'Ongoing',
    description: 'Ongoing support and refinement to ensure sustainable improvements and long-term value creation through continuous optimization.',
    icon: CheckCircleIcon,
    color: 'from-teamx-health-teal to-teamx-trust-green',
    activities: [
      'Performance monitoring and analysis',
      'Continuous process refinement',
      'Advanced analytics implementation',
      'Expansion planning',
      'Team development and coaching',
      'Best practice sharing'
    ],
    deliverables: [
      'Optimization Reports',
      'Advanced Analytics Platform',
      'Growth Strategy Updates',
      'Ongoing Training Programs',
      'Knowledge Transfer Materials'
    ],
    keyFocus: 'Sustaining improvements and driving continuous growth',
    outcomes: [
      'Sustained performance gains',
      'Continuous improvement culture',
      'Scalable growth achieved',
      'Long-term value creation'
    ]
  }
]

const methodologies = [
  {
    name: 'Lean Healthcare',
    description: 'Eliminate waste and optimize value streams',
    icon: '🏥'
  },
  {
    name: 'Six Sigma',
    description: 'Reduce variation and improve quality',
    icon: '📊'
  },
  {
    name: 'Change Management',
    description: 'Ensure sustainable organizational transformation',
    icon: '🔄'
  },
  {
    name: 'Data Analytics',
    description: 'Drive decisions with actionable insights',
    icon: '📈'
  }
]

const successFactors = [
  {
    title: 'Leadership Engagement',
    description: 'Strong executive sponsorship and visible commitment throughout the transformation journey.',
    importance: 'Critical'
  },
  {
    title: 'Clear Communication',
    description: 'Transparent, consistent messaging to all stakeholders about goals, progress, and expectations.',
    importance: 'High'
  },
  {
    title: 'Team Involvement',
    description: 'Active participation from all levels of the organization in solution design and implementation.',
    importance: 'High'
  },
  {
    title: 'Adequate Resources',
    description: 'Sufficient time, budget, and personnel allocated to ensure successful implementation.',
    importance: 'High'
  },
  {
    title: 'Performance Measurement',
    description: 'Robust metrics and monitoring systems to track progress and identify areas for adjustment.',
    importance: 'Medium'
  },
  {
    title: 'Continuous Learning',
    description: 'Commitment to ongoing improvement and adaptation based on results and feedback.',
    importance: 'Medium'
  }
]

export default function Process() {
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
            Our Process
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            A proven, structured methodology that ensures consistent results and sustainable 
            transformation for healthcare organizations of all sizes.
          </p>
        </motion.div>
      </section>

      {/* Process Phases */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Four-Phase Methodology
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Each phase builds upon the previous one, ensuring comprehensive transformation 
              and sustainable results for your organization.
            </p>
          </motion.div>

          <div className="space-y-24">
            {processPhases.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="relative"
              >
                {/* Phase Header */}
                <div className="flex items-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg mr-6`}>
                    <phase.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-2xl font-bold text-teamx-navy">Phase {phase.phase}</span>
                      <span className="px-3 py-1 bg-teamx-blue/10 text-teamx-blue rounded-full text-sm font-medium">
                        {phase.duration}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-teamx-charcoal">{phase.title}</h3>
                  </div>
                </div>

                {/* Phase Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Description */}
                  <div className="lg:col-span-1">
                    <p className="text-lg text-teamx-warm-gray mb-6 leading-relaxed">
                      {phase.description}
                    </p>
                    <div className="bg-gradient-to-r from-teamx-blue/5 to-teamx-health-teal/5 p-4 rounded-xl border border-teamx-blue/10">
                      <h4 className="font-semibold text-teamx-navy mb-2">Key Focus</h4>
                      <p className="text-teamx-slate text-sm">{phase.keyFocus}</p>
                    </div>
                  </div>

                  {/* Activities & Deliverables */}
                  <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Activities */}
                      <div>
                        <h4 className="text-xl font-semibold text-teamx-charcoal mb-4 flex items-center">
                          <CogIcon className="h-5 w-5 mr-2 text-teamx-blue" />
                          Key Activities
                        </h4>
                        <ul className="space-y-2">
                          {phase.activities.map((activity, activityIndex) => (
                            <motion.li
                              key={activity}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: activityIndex * 0.05 }}
                              className="flex items-start space-x-2"
                            >
                              <div className="w-1.5 h-1.5 bg-teamx-trust-green rounded-full mt-2 flex-shrink-0" />
                              <span className="text-teamx-warm-gray text-sm">{activity}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <h4 className="text-xl font-semibold text-teamx-charcoal mb-4 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-teamx-blue" />
                          Deliverables
                        </h4>
                        <ul className="space-y-2">
                          {phase.deliverables.map((deliverable, deliverableIndex) => (
                            <motion.li
                              key={deliverable}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: deliverableIndex * 0.05 }}
                              className="flex items-start space-x-2"
                            >
                              <CheckCircleIcon className="h-4 w-4 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                              <span className="text-teamx-warm-gray text-sm">{deliverable}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Outcomes */}
                    <div className="mt-6 p-6 bg-slate-50 rounded-2xl">
                      <h4 className="text-lg font-semibold text-teamx-charcoal mb-3 flex items-center">
                        <PresentationChartBarIcon className="h-5 w-5 mr-2 text-teamx-health-teal" />
                        Expected Outcomes
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {phase.outcomes.map((outcome, outcomeIndex) => (
                          <motion.div
                            key={outcome}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: outcomeIndex * 0.05 }}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-2 h-2 bg-teamx-health-teal rounded-full mt-2 flex-shrink-0" />
                            <span className="text-teamx-slate text-sm">{outcome}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phase Connector */}
                {index < processPhases.length - 1 && (
                  <div className="flex justify-center mt-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-8 h-8 bg-gradient-to-br from-teamx-blue to-teamx-health-teal rounded-full flex items-center justify-center"
                    >
                      <ArrowRightIcon className="h-4 w-4 text-white rotate-90" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodologies */}
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
              Proven Methodologies
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              We leverage industry-leading frameworks and best practices to ensure 
              systematic and sustainable transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {methodologies.map((methodology, index) => (
              <motion.div
                key={methodology.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-professional transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4">{methodology.icon}</div>
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">
                  {methodology.name}
                </h3>
                <p className="text-teamx-warm-gray leading-relaxed">
                  {methodology.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Factors */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Critical Success Factors
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Key elements that determine the success of healthcare transformation initiatives 
              based on our experience with 150+ organizations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successFactors.map((factor, index) => (
              <motion.div
                key={factor.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-teamx-charcoal">
                    {factor.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    factor.importance === 'Critical' 
                      ? 'bg-red-100 text-red-800'
                      : factor.importance === 'High'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {factor.importance}
                  </span>
                </div>
                <p className="text-teamx-warm-gray leading-relaxed">
                  {factor.description}
                </p>
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
              Ready to Start Your Transformation?
            </h2>
            <p className="mt-6 text-lg text-blue-200 max-w-2xl mx-auto">
              Let&apos;s discuss how our proven process can help your healthcare organization 
              achieve sustainable growth and operational excellence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Schedule Discovery Call
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-teamx-navy transition-all duration-200"
              >
                Explore Our Services
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}