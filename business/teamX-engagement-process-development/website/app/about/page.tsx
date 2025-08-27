'use client'

import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, UsersIcon, HeartIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/solid'

const values = [
  {
    name: 'Excellence',
    description: 'We deliver exceptional results through rigorous methodology and unwavering commitment to quality.',
    icon: CheckCircleIcon,
    color: 'from-teamx-navy to-teamx-blue'
  },
  {
    name: 'Innovation',
    description: 'We embrace cutting-edge approaches and technologies to drive healthcare transformation.',
    icon: ArrowTrendingUpIcon,
    color: 'from-teamx-blue to-teamx-light-blue'
  },
  {
    name: 'Collaboration',
    description: 'We work as true partners with our clients, ensuring sustainable change and knowledge transfer.',
    icon: UsersIcon,
    color: 'from-teamx-light-blue to-teamx-health-teal'
  },
  {
    name: 'Impact',
    description: 'We focus on meaningful outcomes that improve patient care and organizational performance.',
    icon: HeartIcon,
    color: 'from-teamx-health-teal to-teamx-trust-green'
  }
]

const milestones = [
  { year: '2009', event: 'TeamX Healthcare Consulting founded' },
  { year: '2012', event: 'First major health system transformation completed' },
  { year: '2015', event: 'Expanded to serve 50+ healthcare organizations' },
  { year: '2018', event: 'Launched digital transformation practice' },
  { year: '2021', event: 'Achieved 100+ successful client engagements' },
  { year: '2024', event: 'Recognized as top healthcare consulting firm' }
]

const stats = [
  { value: '150+', label: 'Healthcare Organizations Served' },
  { value: '250%', label: 'Average ROI for Clients' },
  { value: '$50M+', label: 'Total Client Savings Generated' },
  { value: '98%', label: 'Client Satisfaction Rate' },
  { value: '15+', label: 'Years of Excellence' },
  { value: '60+', label: 'Combined Team Experience' }
]

export default function About() {
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
            About TeamX
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            We are a specialized healthcare consulting firm dedicated to transforming healthcare 
            organizations through innovative strategies, operational excellence, and sustainable growth.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-teamx-charcoal mb-6">Our Mission</h2>
              <p className="text-lg text-teamx-warm-gray leading-relaxed mb-8">
                To empower healthcare organizations with transformative solutions that enhance patient care, 
                optimize operations, and drive sustainable value creation. We believe that excellence in 
                healthcare consulting leads to better outcomes for patients, providers, and communities.
              </p>
              <div className="bg-gradient-to-r from-teamx-navy/10 to-teamx-blue/10 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-teamx-navy mb-3">Our Vision</h3>
                <p className="text-teamx-warm-gray">
                  To be the most trusted partner for healthcare transformation, setting the standard 
                  for excellence in consulting and creating lasting positive impact across the healthcare ecosystem.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-teamx-navy to-teamx-trust-green p-8 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-5xl font-bold mb-4">15+</div>
                  <div className="text-lg">Years of Excellence</div>
                  <div className="text-3xl font-bold mt-6 mb-2">150+</div>
                  <div className="text-lg">Organizations Transformed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              These principles guide everything we do and define our commitment to excellence in healthcare consulting.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6`}>
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">{value.name}</h3>
                <p className="text-teamx-warm-gray leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">Our Journey</h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Key milestones in our mission to transform healthcare organizations across North America.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teamx-navy to-teamx-trust-green opacity-30" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } flex-col lg:space-x-12`}
                >
                  <div className="flex-1 max-w-md">
                    <div className={`bg-white p-6 rounded-2xl shadow-soft border border-slate-100 ${
                      index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'
                    } text-center`}>
                      <div className="text-2xl font-bold text-teamx-navy mb-2">{milestone.year}</div>
                      <div className="text-teamx-warm-gray">{milestone.event}</div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teamx-navy to-teamx-blue rounded-full shadow-lg my-6 lg:my-0">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                  
                  <div className="flex-1 max-w-md lg:block hidden" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-br from-teamx-navy to-teamx-blue text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">Our Impact by the Numbers</h2>
            <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
              Measurable results that demonstrate our commitment to healthcare excellence and transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-2xl"
              >
                <div className="text-4xl font-bold text-teamx-accent-blue mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
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
              Ready to Partner with TeamX?
            </h2>
            <p className="mt-6 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Let&apos;s discuss how our proven expertise can help transform your healthcare organization 
              and achieve sustainable growth.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Start Your Transformation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy border-2 border-teamx-navy rounded-xl hover:bg-teamx-navy hover:text-white transition-all duration-200"
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