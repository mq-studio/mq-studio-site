'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

export default function Hero() {
  return (
    <section id="home" className="relative isolate px-6 pt-14 lg:px-8 min-h-screen flex items-center">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teamx-navy to-teamx-blue opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      
      <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden sm:mb-8 sm:flex sm:justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative rounded-full px-3 py-1 text-sm leading-6 text-teamx-warm-gray ring-1 ring-teamx-light-slate/20 hover:ring-teamx-light-slate/30 transition-colors duration-200"
          >
            Transforming Healthcare Organizations{' '}
            <Link href="/services" className="font-semibold text-teamx-navy">
              <span className="absolute inset-0" aria-hidden="true" />
              Learn more <span aria-hidden="true">&rarr;</span>
            </Link>
          </motion.div>
        </motion.div>
        
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl font-bold tracking-tight text-teamx-charcoal sm:text-6xl lg:text-7xl"
          >
            Healthcare Consulting
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block bg-gradient-primary bg-clip-text text-transparent"
            >
              Excellence
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-6 text-lg leading-8 text-teamx-warm-gray sm:text-xl max-w-3xl mx-auto"
          >
            TeamX delivers transformative healthcare consulting services, specializing in 
            operational optimization, strategic growth, and sustainable value creation for 
            healthcare organizations across North America.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-x-6 flex-col sm:flex-row space-y-4 sm:space-y-0"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="group rounded-lg bg-gradient-primary px-8 py-3 text-sm font-semibold text-white shadow-professional hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                Start Your Transformation
                <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                href="/services"
                className="text-sm font-semibold leading-6 text-teamx-navy hover:text-teamx-blue transition-colors duration-200"
              >
                Explore Services <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {[
              { label: 'Healthcare Organizations Served', value: '150+' },
              { label: 'Average ROI Improvement', value: '250%' },
              { label: 'Years of Excellence', value: '15+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
                className="relative text-center"
              >
                <dt className="text-base leading-7 text-teamx-warm-gray">{stat.label}</dt>
                <dd className="text-3xl font-bold leading-9 tracking-tight text-teamx-navy sm:text-4xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
      
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-teamx-health-teal to-teamx-trust-green opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </section>
  )
}