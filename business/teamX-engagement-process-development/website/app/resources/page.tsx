'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  DocumentTextIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  NewspaperIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'

const whitepapers = [
  {
    title: "Digital Transformation in Healthcare: A Strategic Roadmap",
    description: "Comprehensive guide to implementing digital transformation initiatives that drive operational efficiency and improve patient outcomes.",
    category: "Digital Strategy",
    downloadUrl: "#",
    pages: 24,
    readTime: "15 min",
    featured: true
  },
  {
    title: "Value-Based Care Implementation Framework",
    description: "Step-by-step methodology for transitioning from fee-for-service to value-based care models with proven ROI strategies.",
    category: "Value-Based Care",
    downloadUrl: "#",
    pages: 32,
    readTime: "20 min",
    featured: true
  },
  {
    title: "Healthcare Analytics: Turning Data into Actionable Insights",
    description: "Best practices for leveraging healthcare data to drive clinical and operational decision-making.",
    category: "Analytics",
    downloadUrl: "#",
    pages: 18,
    readTime: "12 min",
    featured: false
  },
  {
    title: "Change Management in Healthcare Organizations",
    description: "Proven strategies for managing organizational change in complex healthcare environments.",
    category: "Change Management",
    downloadUrl: "#",
    pages: 28,
    readTime: "18 min",
    featured: false
  },
  {
    title: "Operational Excellence in Clinical Operations",
    description: "Framework for achieving operational excellence through process optimization and quality improvement.",
    category: "Operations",
    downloadUrl: "#",
    pages: 36,
    readTime: "25 min",
    featured: false
  }
]

const caseStudiesPreview = [
  {
    title: "Regional Health System Transformation",
    summary: "Comprehensive operational overhaul resulting in 35% cost reduction and improved patient satisfaction.",
    metrics: { savings: "$12M", efficiency: "+40%", satisfaction: "+28%" },
    industry: "Multi-Specialty Health System",
    timeline: "18 months"
  },
  {
    title: "Specialty Clinic Network Optimization",
    summary: "Strategic growth initiative expanding market reach while maintaining quality standards.",
    metrics: { revenue: "+65%", locations: "+12", patients: "+2,500" },
    industry: "Specialty Care Network",
    timeline: "24 months"
  },
  {
    title: "Academic Medical Center Analytics",
    summary: "Implementation of comprehensive analytics platform driving evidence-based decision making.",
    metrics: { insights: "1,200+", decisions: "+90%", outcomes: "+22%" },
    industry: "Academic Medical Center",
    timeline: "12 months"
  }
]

const blogPosts = [
  {
    title: "The Future of Healthcare Delivery: Trends Shaping 2024",
    excerpt: "Exploring emerging trends in healthcare delivery models and their impact on patient care and organizational strategy.",
    author: "Dr. Sarah Chen",
    readTime: "8 min",
    publishedDate: "December 15, 2023",
    category: "Industry Insights",
    featured: true
  },
  {
    title: "Implementing AI in Healthcare: A Practical Approach",
    excerpt: "Step-by-step guide to successfully integrating artificial intelligence tools in healthcare operations.",
    author: "Michael Rodriguez",
    readTime: "12 min",
    publishedDate: "December 8, 2023",
    category: "Technology",
    featured: true
  },
  {
    title: "Patient Experience Excellence: Beyond Satisfaction Scores",
    excerpt: "Strategies for creating exceptional patient experiences that drive loyalty and improved outcomes.",
    author: "Jennifer Walsh",
    readTime: "10 min",
    publishedDate: "November 28, 2023",
    category: "Patient Experience",
    featured: false
  },
  {
    title: "Healthcare Leadership in Times of Change",
    excerpt: "Essential leadership skills for healthcare executives navigating rapid industry transformation.",
    author: "Dr. Robert Kim",
    readTime: "7 min",
    publishedDate: "November 20, 2023",
    category: "Leadership",
    featured: false
  }
]

const investorResources = [
  {
    title: "TeamX Investment Overview",
    description: "Comprehensive overview of investment opportunities and growth projections in healthcare consulting.",
    type: "Investment Deck",
    downloadUrl: "#",
    restricted: true
  },
  {
    title: "Market Analysis: Healthcare Consulting 2024",
    description: "In-depth analysis of the healthcare consulting market landscape and growth opportunities.",
    type: "Market Report",
    downloadUrl: "#",
    restricted: true
  },
  {
    title: "TeamX Financial Performance Summary",
    description: "Key financial metrics and performance indicators demonstrating consistent growth and profitability.",
    type: "Financial Summary",
    downloadUrl: "#",
    restricted: true
  }
]

export default function Resources() {
  const [calculatorData, setCalculatorData] = useState({
    currentCosts: 0,
    staffCount: 0,
    patientVolume: 0,
    inefficiencyRate: 20
  })
  const [calculatorResults, setCalculatorResults] = useState<{
    annualSavings: number
    productivityGains: number
    patientVolumeIncrease: number
    totalBenefit: number
    investmentCost: number
    roi: number
    paybackMonths: number
  } | null>(null)

  const calculateROI = () => {
    const annualSavings = (calculatorData.currentCosts * (calculatorData.inefficiencyRate / 100)) * 0.75
    const productivityGains = calculatorData.staffCount * 25000 * 0.3
    const patientVolumeIncrease = calculatorData.patientVolume * 150 * 0.15
    const totalBenefit = annualSavings + productivityGains + patientVolumeIncrease
    const investmentCost = Math.max(75000, totalBenefit * 0.15)
    const roi = ((totalBenefit - investmentCost) / investmentCost) * 100
    const paybackMonths = (investmentCost / (totalBenefit / 12))

    setCalculatorResults({
      annualSavings,
      productivityGains,
      patientVolumeIncrease,
      totalBenefit,
      investmentCost,
      roi,
      paybackMonths
    })
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
            Resources & Insights
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            Access our comprehensive library of whitepapers, case studies, tools, and insights 
            to drive your healthcare transformation initiatives.
          </p>
        </motion.div>
      </section>

      {/* Whitepapers Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <DocumentTextIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Strategic Whitepapers
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Expert insights and proven frameworks to guide your healthcare transformation journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Whitepapers */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Featured Publications</h3>
              <div className="space-y-6">
                {whitepapers.filter(wp => wp.featured).map((whitepaper, index) => (
                  <motion.div
                    key={whitepaper.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teamx-navy text-white">
                        {whitepaper.category}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-teamx-warm-gray">
                        <span className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          {whitepaper.pages} pages
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {whitepaper.readTime}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-teamx-charcoal mb-3">
                      {whitepaper.title}
                    </h4>
                    <p className="text-teamx-warm-gray mb-6 leading-relaxed">
                      {whitepaper.description}
                    </p>
                    <motion.a
                      href={whitepaper.downloadUrl}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download Now
                    </motion.a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Whitepapers List */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Complete Library</h3>
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-soft">
                <div className="space-y-4">
                  {whitepapers.map((whitepaper, index) => (
                    <motion.div
                      key={whitepaper.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h5 className="font-semibold text-teamx-charcoal mb-1">
                          {whitepaper.title}
                        </h5>
                        <div className="flex items-center space-x-4 text-sm text-teamx-warm-gray">
                          <span>{whitepaper.category}</span>
                          <span>•</span>
                          <span>{whitepaper.readTime}</span>
                        </div>
                      </div>
                      <motion.a
                        href={whitepaper.downloadUrl}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-teamx-navy hover:bg-teamx-navy hover:text-white rounded-lg transition-all duration-200"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </motion.a>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Preview */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <PresentationChartLineIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Real results from healthcare organizations that have transformed their operations with TeamX.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {caseStudiesPreview.map((caseStudy, index) => (
              <motion.div
                key={caseStudy.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teamx-health-teal text-white">
                    {caseStudy.industry}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">
                  {caseStudy.title}
                </h3>
                <p className="text-teamx-warm-gray mb-6 leading-relaxed">
                  {caseStudy.summary}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(caseStudy.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-teamx-navy">{value}</div>
                      <div className="text-xs text-teamx-warm-gray capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-teamx-warm-gray mb-4">
                  Timeline: {caseStudy.timeline}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.a
              href="/case-studies"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
            >
              View All Case Studies
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Value Calculator */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <CalculatorIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              ROI Calculator
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Calculate the potential return on investment for your healthcare transformation initiative.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Calculator Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft"
            >
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">
                Enter Your Organization&apos;s Data
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Annual Operating Costs ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorData.currentCosts}
                    onChange={(e) => setCalculatorData({...calculatorData, currentCosts: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    placeholder="5000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Number of Staff
                  </label>
                  <input
                    type="number"
                    value={calculatorData.staffCount}
                    onChange={(e) => setCalculatorData({...calculatorData, staffCount: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Annual Patient Volume
                  </label>
                  <input
                    type="number"
                    value={calculatorData.patientVolume}
                    onChange={(e) => setCalculatorData({...calculatorData, patientVolume: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-teamx-charcoal mb-2">
                    Estimated Inefficiency Rate (%)
                  </label>
                  <select
                    value={calculatorData.inefficiencyRate}
                    onChange={(e) => setCalculatorData({...calculatorData, inefficiencyRate: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teamx-navy focus:border-transparent transition-all duration-200"
                  >
                    <option value={10}>10% - Highly Optimized</option>
                    <option value={20}>20% - Well Managed</option>
                    <option value={30}>30% - Average</option>
                    <option value={40}>40% - Needs Improvement</option>
                    <option value={50}>50% - Significant Issues</option>
                  </select>
                </div>

                <motion.button
                  onClick={calculateROI}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
                >
                  Calculate ROI
                </motion.button>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white border border-gray-200 p-8 rounded-3xl shadow-soft"
            >
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">
                Projected Results
              </h3>
              
              {calculatorResults ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-teamx-trust-green/10 to-teamx-health-teal/10 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-teamx-trust-green">
                        ${Math.round(calculatorResults.totalBenefit).toLocaleString()}
                      </div>
                      <div className="text-sm text-teamx-warm-gray">Total Annual Benefit</div>
                    </div>

                    <div className="bg-gradient-to-br from-teamx-navy/10 to-teamx-blue/10 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-teamx-navy">
                        {Math.round(calculatorResults.roi)}%
                      </div>
                      <div className="text-sm text-teamx-warm-gray">Return on Investment</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-teamx-warm-gray">Operational Savings</span>
                      <span className="font-semibold text-teamx-charcoal">
                        ${Math.round(calculatorResults.annualSavings).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-teamx-warm-gray">Productivity Gains</span>
                      <span className="font-semibold text-teamx-charcoal">
                        ${Math.round(calculatorResults.productivityGains).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-teamx-warm-gray">Revenue Growth</span>
                      <span className="font-semibold text-teamx-charcoal">
                        ${Math.round(calculatorResults.patientVolumeIncrease).toLocaleString()}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-teamx-warm-gray">Investment Required</span>
                      <span className="font-semibold text-teamx-charcoal">
                        ${Math.round(calculatorResults.investmentCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-teamx-warm-gray">Payback Period</span>
                      <span className="font-semibold text-teamx-charcoal">
                        {Math.round(calculatorResults.paybackMonths)} months
                      </span>
                    </div>
                  </div>

                  <div className="bg-teamx-background p-4 rounded-xl">
                    <p className="text-sm text-teamx-warm-gray">
                      <strong>Note:</strong> These projections are based on industry averages and TeamX&apos;s historical 
                      performance. Actual results may vary based on organization-specific factors.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ArrowTrendingUpIcon className="h-16 w-16 text-teamx-light-slate mx-auto mb-4" />
                  <p className="text-teamx-warm-gray">
                    Enter your organization&apos;s data to see projected ROI calculations.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog/Insights Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <NewspaperIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Latest Insights
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Stay informed with our latest thoughts on healthcare industry trends and best practices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Featured Posts */}
            <div className="space-y-8">
              {blogPosts.filter(post => post.featured).map((post, index) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teamx-health-teal text-white">
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-4 text-sm text-teamx-warm-gray">
                      <span>{post.readTime}</span>
                      <span>•</span>
                      <span>{post.publishedDate}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-teamx-charcoal mb-3 hover:text-teamx-navy transition-colors duration-200 cursor-pointer">
                    {post.title}
                  </h3>
                  
                  <p className="text-teamx-warm-gray mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-teamx-warm-gray">
                      By {post.author}
                    </span>
                    <motion.a
                      href="#"
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center text-sm font-semibold text-teamx-navy hover:text-teamx-blue transition-colors duration-200"
                    >
                      Read More
                      <ArrowRightIcon className="ml-1 h-4 w-4" />
                    </motion.a>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Recent Posts List */}
            <div className="bg-white p-8 rounded-3xl shadow-soft">
              <h3 className="text-xl font-semibold text-teamx-charcoal mb-6">Recent Articles</h3>
              <div className="space-y-4">
                {blogPosts.map((post, index) => (
                  <motion.div
                    key={post.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="mb-2">
                      <h4 className="font-semibold text-teamx-charcoal hover:text-teamx-navy transition-colors duration-200 cursor-pointer">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-teamx-warm-gray">{post.author}</span>
                        <span className="text-xs text-teamx-warm-gray">•</span>
                        <span className="text-xs text-teamx-warm-gray">{post.readTime}</span>
                        <span className="text-xs text-teamx-warm-gray">•</span>
                        <span className="text-xs px-2 py-1 bg-teamx-background rounded text-teamx-slate">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-teamx-warm-gray leading-relaxed">
                      {post.excerpt.substring(0, 120)}...
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy border-2 border-teamx-navy rounded-xl hover:bg-teamx-navy hover:text-white transition-all duration-200"
            >
              View All Articles
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Investor Resources Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <CursorArrowRaysIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Investor Resources
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Access comprehensive investment materials and market analysis for qualified investors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {investorResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-teamx-navy/5 to-teamx-blue/5 p-8 rounded-3xl shadow-soft border border-teamx-navy/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teamx-navy text-white">
                    {resource.type}
                  </span>
                  {resource.restricted && (
                    <span className="text-xs text-teamx-warm-gray">Restricted</span>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">
                  {resource.title}
                </h3>
                
                <p className="text-teamx-warm-gray mb-6 leading-relaxed">
                  {resource.description}
                </p>
                
                <motion.a
                  href={resource.downloadUrl}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-teamx-navy border-2 border-teamx-navy rounded-xl hover:bg-teamx-navy hover:text-white transition-all duration-200"
                >
                  Request Access
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </motion.a>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <motion.a
              href="/investors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
            >
              Visit Investor Relations
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </motion.a>
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
              Ready to Transform Your Organization?
            </h2>
            <p className="mt-6 text-lg text-blue-200 max-w-2xl mx-auto">
              Use these resources to guide your transformation journey, or contact our experts 
              for personalized consultation and support.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Schedule Consultation
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/case-studies"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-teamx-navy transition-all duration-200"
              >
                View Success Stories
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}