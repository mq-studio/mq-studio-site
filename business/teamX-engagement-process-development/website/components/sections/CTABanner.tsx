'use client'

import { motion } from 'framer-motion'
import { ArrowRightIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

const benefits = [
  'Free initial consultation',
  'Customized transformation roadmap',
  'Expert team with 60+ years combined experience',
  'Proven track record of 250%+ ROI',
  'Ongoing support throughout implementation'
]

export default function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-teamx-navy via-teamx-blue to-teamx-light-blue" />
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Floating elements */}
      <motion.div
        animate={{ 
          y: [-20, 20, -20],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 left-10 w-24 h-24 border border-white/20 rounded-full"
      />
      <motion.div
        animate={{ 
          y: [20, -20, 20],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 right-20 w-16 h-16 border border-white/20 rounded-xl"
      />
      <motion.div
        animate={{ 
          y: [-10, 30, -10],
          x: [-10, 10, -10]
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-20 left-1/4 w-8 h-8 bg-white/10 rounded-full"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Transform Your
              <span className="block text-teamx-accent-blue">
                Healthcare Organization?
              </span>
            </h2>
            <p className="mt-6 text-lg lg:text-xl leading-8 text-blue-100">
              Join 150+ healthcare organizations that have achieved exceptional results with TeamX. 
              Start your transformation journey today with a complimentary strategic assessment.
            </p>

            {/* Benefits list */}
            <div className="mt-8 space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircleIcon className="h-5 w-5 text-teamx-trust-green flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Contact info */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-2 text-blue-200">
                <PhoneIcon className="h-5 w-5" />
                <span>1-800-TEAMX-01</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-200">
                <EnvelopeIcon className="h-5 w-5" />
                <span>consult@teamx-healthcare.com</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Form/Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-teamx-charcoal mb-2">
                Start Your Transformation
              </h3>
              <p className="text-teamx-warm-gray mb-8">
                Schedule your complimentary strategic consultation
              </p>

              {/* Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full group bg-gradient-primary text-white font-semibold py-4 px-8 rounded-xl shadow-professional hover:shadow-lg transition-all duration-200 mb-4"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>Schedule Free Consultation</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.button>

              {/* Secondary CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-teamx-blue border-2 border-teamx-blue font-semibold py-3 px-8 rounded-xl hover:bg-teamx-blue hover:text-white transition-all duration-200 mb-6"
              >
                Download Case Studies
              </motion.button>

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teamx-navy">150+</div>
                  <div className="text-xs text-teamx-warm-gray">Organizations Served</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teamx-navy">250%</div>
                  <div className="text-xs text-teamx-warm-gray">Average ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teamx-navy">15+</div>
                  <div className="text-xs text-teamx-warm-gray">Years Experience</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-6 lg:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center text-white">
            <div>
              <div className="text-3xl font-bold text-teamx-accent-blue">$50M+</div>
              <div className="text-blue-200">Total Client Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teamx-accent-blue">98%</div>
              <div className="text-blue-200">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teamx-accent-blue">24/7</div>
              <div className="text-blue-200">Implementation Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teamx-accent-blue">100%</div>
              <div className="text-blue-200">Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}