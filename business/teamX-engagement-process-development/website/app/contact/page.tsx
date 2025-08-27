'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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
            Contact TeamX
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            Ready to transform your healthcare organization? Let&apos;s discuss how our proven expertise 
            can drive measurable results and sustainable growth.
          </p>
        </motion.div>
      </section>

      {/* Contact Form */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-teamx-charcoal mb-6">
                Get Started Today
              </h2>
              <p className="text-lg text-teamx-warm-gray mb-8">
                Complete the form below and we&apos;ll get back to you within 4 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-teamx-charcoal mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                    placeholder="your.email@organization.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                    placeholder="Your healthcare organization"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teamx-blue focus:border-transparent transition-colors duration-200"
                    placeholder="Tell us about your challenges and goals..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200 group"
                >
                  Send Message
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-teamx-charcoal mb-6">
                Get In Touch
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teamx-navy to-teamx-blue rounded-xl flex items-center justify-center">
                    <PhoneIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-teamx-charcoal">Phone</h4>
                    <p className="text-teamx-blue font-medium">1-800-TEAMX-01</p>
                    <p className="text-teamx-warm-gray text-sm">Mon-Fri, 8am-6pm EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teamx-navy to-teamx-blue rounded-xl flex items-center justify-center">
                    <EnvelopeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-teamx-charcoal">Email</h4>
                    <p className="text-teamx-blue font-medium">consult@teamx-healthcare.com</p>
                    <p className="text-teamx-warm-gray text-sm">Response within 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teamx-navy to-teamx-blue rounded-xl flex items-center justify-center">
                    <MapPinIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-teamx-charcoal">Office</h4>
                    <p className="text-teamx-blue font-medium">Toronto, ON</p>
                    <p className="text-teamx-warm-gray text-sm">By appointment only</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
                <h4 className="text-xl font-semibold text-teamx-charcoal mb-4">
                  Why Choose TeamX?
                </h4>
                <div className="space-y-3">
                  {[
                    'Free initial consultation',
                    'Proven track record of success',
                    'Expert team with 60+ years experience',
                    'Customized solutions for your needs'
                  ].map((item, index) => (
                    <div key={item} className="flex items-start space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                      <span className="text-teamx-warm-gray">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-br from-teamx-navy to-teamx-blue text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Why Healthcare Leaders Trust TeamX
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '150+', label: 'Organizations Served' },
              { value: '250%', label: 'Average ROI' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '15+', label: 'Years Experience' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-teamx-accent-blue mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}