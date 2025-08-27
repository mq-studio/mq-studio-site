'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAmericasIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentArrowDownIcon,
  LockClosedIcon,
  PresentationChartLineIcon,
  CalendarDaysIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'

const investmentHighlights = [
  {
    title: 'Market Leadership',
    description: 'Recognized leader in healthcare consulting with proven track record of delivering measurable results',
    icon: ArrowTrendingUpIcon,
    metric: '#1 ROI',
    subMetric: 'in healthcare consulting'
  },
  {
    title: 'Scalable Growth',
    description: 'Systematic approach to business development with recurring revenue and expanding client base',
    icon: ChartBarIcon,
    metric: '68% Growth',
    subMetric: 'year-over-year revenue'
  },
  {
    title: 'Market Opportunity',
    description: '$4.2B addressable market in healthcare consulting with significant room for expansion',
    icon: GlobeAmericasIcon,
    metric: '$4.2B',
    subMetric: 'total addressable market'
  },
  {
    title: 'Proven Results',
    description: 'Consistent delivery of 300%+ ROI for clients with 95% client satisfaction and retention rates',
    icon: CheckCircleIcon,
    metric: '300%+ ROI',
    subMetric: 'average client results'
  }
]

const marketOpportunity = [
  {
    segment: 'Healthcare Digital Transformation',
    size: '$1.8B',
    growth: '12.5%',
    opportunity: 'Aging infrastructure and regulatory demands drive massive transformation needs'
  },
  {
    segment: 'Operational Excellence',
    size: '$1.2B',
    growth: '9.8%',
    opportunity: 'Rising costs and margin pressure require systematic operational improvements'
  },
  {
    segment: 'Value-Based Care',
    size: '$900M',
    growth: '18.2%',
    opportunity: 'Shift from fee-for-service creates need for specialized consulting expertise'
  },
  {
    segment: 'Healthcare Analytics',
    size: '$300M',
    growth: '22.1%',
    opportunity: 'Data-driven decision making becomes critical for competitive advantage'
  }
]

const financialMetrics = [
  { label: 'Annual Revenue', value: '$12.4M', growth: '+68%', period: '2023' },
  { label: 'Gross Margin', value: '87%', growth: '+3%', period: 'Industry Leading' },
  { label: 'Client Retention', value: '95%', growth: '+2%', period: 'Best in Class' },
  { label: 'Average Project ROI', value: '425%', growth: '+15%', period: 'Client Results' },
  { label: 'Revenue Per Employee', value: '$620K', growth: '+24%', period: 'Highly Efficient' },
  { label: 'Recurring Revenue', value: '72%', growth: '+12%', period: 'Predictable Growth' }
]

const growthProjections = [
  { year: '2024', revenue: '$18.2M', margin: '89%', employees: 32 },
  { year: '2025', revenue: '$28.5M', margin: '91%', employees: 48 },
  { year: '2026', revenue: '$42.8M', margin: '92%', employees: 68 },
  { year: '2027', revenue: '$58.4M', margin: '93%', employees: 86 }
]

const competitiveAdvantages = [
  'Proprietary healthcare transformation methodology',
  'Deep domain expertise with 150+ years combined experience',
  'Proven ROI track record with measurable, sustainable results',
  'Scalable service delivery model with high-margin offerings',
  'Strong client relationships with 95% retention rate',
  'Technology-enabled solutions driving operational efficiency'
]

export default function Investors() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    investorType: '',
    investmentRange: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative isolate px-6 pt-14 lg:px-8 py-24 sm:py-32 bg-gradient-to-br from-teamx-navy to-teamx-blue text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Investor Relations
          </h1>
          <p className="mt-6 text-xl leading-8 text-blue-200 max-w-3xl mx-auto">
            Partner with TeamX to capitalize on the $4.2B healthcare consulting opportunity 
            while delivering transformational value to healthcare organizations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
            >
              Request Information
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </motion.a>
            <motion.a
              href="#overview"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-teamx-navy transition-all duration-200"
            >
              Investment Overview
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Investment Highlights */}
      <section id="overview" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Investment Highlights
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              TeamX represents a compelling investment opportunity at the intersection of healthcare 
              transformation and operational excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {investmentHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <highlight.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-teamx-charcoal">
                        {highlight.title}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teamx-trust-green">
                      {highlight.metric}
                    </div>
                    <div className="text-sm text-teamx-warm-gray">
                      {highlight.subMetric}
                    </div>
                  </div>
                </div>
                <p className="text-teamx-warm-gray leading-relaxed">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <GlobeAmericasIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Market Opportunity
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              The healthcare consulting market is experiencing unprecedented growth driven by 
              digital transformation, cost pressures, and regulatory requirements.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {marketOpportunity.map((segment, index) => (
              <motion.div
                key={segment.segment}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-teamx-charcoal">
                    {segment.segment}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-teamx-navy">
                        {segment.size}
                      </div>
                      <div className="text-xs text-teamx-warm-gray">Market Size</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teamx-trust-green">
                        {segment.growth}
                      </div>
                      <div className="text-xs text-teamx-warm-gray">CAGR</div>
                    </div>
                  </div>
                </div>
                <p className="text-teamx-warm-gray leading-relaxed">
                  {segment.opportunity}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="text-center bg-white p-8 rounded-3xl shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-teamx-navy mb-2">$4.2B</div>
                <div className="text-teamx-warm-gray">Total Addressable Market</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teamx-trust-green mb-2">13.8%</div>
                <div className="text-teamx-warm-gray">Market CAGR 2024-2027</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-teamx-health-teal mb-2">2.1%</div>
                <div className="text-teamx-warm-gray">Current Market Share</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Performance */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <ChartBarIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Financial Performance
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Consistent growth trajectory with industry-leading margins and client satisfaction metrics.
            </p>
          </motion.div>

          {/* Current Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {financialMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-gradient-to-br from-teamx-background to-white p-6 rounded-2xl border border-gray-200 shadow-soft"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-teamx-navy mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm text-teamx-warm-gray mb-2">
                    {metric.label}
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs font-semibold text-teamx-trust-green">
                      {metric.growth}
                    </span>
                    <span className="text-xs text-teamx-warm-gray">
                      {metric.period}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Growth Projections */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft">
            <h3 className="text-2xl font-semibold text-teamx-charcoal mb-8 text-center">
              Growth Projections (2024-2027)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-teamx-charcoal">Year</th>
                    <th className="text-center py-4 px-4 font-semibold text-teamx-charcoal">Revenue</th>
                    <th className="text-center py-4 px-4 font-semibold text-teamx-charcoal">Gross Margin</th>
                    <th className="text-center py-4 px-4 font-semibold text-teamx-charcoal">Employees</th>
                  </tr>
                </thead>
                <tbody>
                  {growthProjections.map((year, index) => (
                    <motion.tr
                      key={year.year}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 px-4 font-semibold text-teamx-navy">{year.year}</td>
                      <td className="py-4 px-4 text-center text-teamx-charcoal">{year.revenue}</td>
                      <td className="py-4 px-4 text-center text-teamx-trust-green">{year.margin}</td>
                      <td className="py-4 px-4 text-center text-teamx-warm-gray">{year.employees}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <ScaleIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Competitive Advantages
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Our unique combination of healthcare expertise, proven methodologies, and technology 
              creates sustainable competitive advantages.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {competitiveAdvantages.map((advantage, index) => (
                <motion.div
                  key={advantage}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircleIcon className="h-6 w-6 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                  <span className="text-teamx-warm-gray leading-relaxed">{advantage}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-soft">
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">
                Key Differentiators
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teamx-warm-gray">Client Retention Rate</span>
                    <span className="font-bold text-teamx-trust-green">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teamx-trust-green h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teamx-warm-gray">Average Project ROI</span>
                    <span className="font-bold text-teamx-navy">425%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teamx-navy h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teamx-warm-gray">Team Expertise (Years)</span>
                    <span className="font-bold text-teamx-blue">150+</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teamx-blue h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-teamx-warm-gray">Implementation Success</span>
                    <span className="font-bold text-teamx-health-teal">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teamx-health-teal h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Contact Form */}
      <section id="contact" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Investment Inquiry
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Interested in learning more about investment opportunities with TeamX? 
              Contact our team for detailed information and materials.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                      placeholder="Investment Partners LLC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Investor Type
                    </label>
                    <select
                      name="investorType"
                      value={formData.investorType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Type</option>
                      <option value="individual">Individual Investor</option>
                      <option value="institutional">Institutional Investor</option>
                      <option value="pe">Private Equity</option>
                      <option value="vc">Venture Capital</option>
                      <option value="strategic">Strategic Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                      Investment Range
                    </label>
                    <select
                      name="investmentRange"
                      value={formData.investmentRange}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select Range</option>
                      <option value="100k-500k">$100K - $500K</option>
                      <option value="500k-1m">$500K - $1M</option>
                      <option value="1m-5m">$1M - $5M</option>
                      <option value="5m+">$5M+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    placeholder="Please tell us about your investment interests and any specific questions you have..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
                >
                  Submit Investment Inquiry
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information & Resources */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Direct Contact */}
              <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-soft">
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">
                  Direct Contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-teamx-navy" />
                    <span className="text-teamx-warm-gray">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-5 w-5 text-teamx-navy" />
                    <span className="text-teamx-warm-gray">investors@teamx.healthcare</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="h-5 w-5 text-teamx-navy" />
                    <span className="text-teamx-warm-gray">Schedule a call within 24 hours</span>
                  </div>
                </div>
              </div>

              {/* Investment Materials */}
              <div className="bg-gradient-to-br from-teamx-navy/5 to-teamx-blue/5 p-8 rounded-3xl border border-teamx-navy/10">
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">
                  Investment Materials
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-soft">
                    <div className="flex items-center space-x-3">
                      <DocumentArrowDownIcon className="h-5 w-5 text-teamx-navy" />
                      <span className="font-medium text-teamx-charcoal">Executive Summary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LockClosedIcon className="h-4 w-4 text-teamx-warm-gray" />
                      <span className="text-sm text-teamx-warm-gray">Qualified Investors</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-soft">
                    <div className="flex items-center space-x-3">
                      <PresentationChartLineIcon className="h-5 w-5 text-teamx-navy" />
                      <span className="font-medium text-teamx-charcoal">Financial Model</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LockClosedIcon className="h-4 w-4 text-teamx-warm-gray" />
                      <span className="text-sm text-teamx-warm-gray">NDA Required</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-soft">
                    <div className="flex items-center space-x-3">
                      <ChartBarIcon className="h-5 w-5 text-teamx-navy" />
                      <span className="font-medium text-teamx-charcoal">Market Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-teamx-warm-gray" />
                      <span className="text-sm text-teamx-warm-gray">Upon Request</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gradient-to-br from-teamx-trust-green/10 to-teamx-health-teal/10 p-8 rounded-3xl">
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-4">
                  Next Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teamx-trust-green rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    <span className="text-teamx-warm-gray">Submit investment inquiry form</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teamx-health-teal rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    <span className="text-teamx-warm-gray">Initial qualification and NDA execution</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teamx-navy rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    <span className="text-teamx-warm-gray">Detailed materials and management presentation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teamx-blue rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                    <span className="text-teamx-warm-gray">Due diligence and final negotiations</span>
                  </div>
                </div>
              </div>
            </motion.div>
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
              Partner with TeamX
            </h2>
            <p className="mt-6 text-lg text-blue-200 max-w-2xl mx-auto">
              Join us in transforming healthcare delivery while generating exceptional returns 
              through our proven business model and market-leading expertise.
            </p>
            <div className="mt-10">
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Begin Investment Discussion
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}