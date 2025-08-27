'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  UsersIcon,
  AcademicCapIcon,
  StarIcon,
  BriefcaseIcon,
  GlobeAmericasIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  TrophyIcon,
  ArrowRightIcon,
  LinkIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

const teamMembers = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Chief Executive Officer & Co-Founder',
    image: '/images/team/sarah-chen.jpg',
    bio: 'Healthcare transformation leader with 20+ years of experience in operational excellence and strategic growth. Former VP of Operations at Johns Hopkins Health System.',
    specialties: ['Healthcare Strategy', 'Operational Excellence', 'Digital Transformation', 'M&A Integration'],
    education: ['MD, Harvard Medical School', 'MBA, Wharton School'],
    certifications: ['Certified Healthcare Executive (CHE)', 'Lean Six Sigma Master Black Belt'],
    achievements: [
      'Led $2B health system transformation at Johns Hopkins',
      'Authored "Healthcare Operations Excellence" (Harvard Business Review)',
      'Named Healthcare Executive of the Year 2022'
    ],
    linkedin: '#',
    email: 'sarah@teamx.healthcare'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Chief Operating Officer & Co-Founder',
    image: '/images/team/michael-rodriguez.jpg',
    bio: 'Operations and technology expert specializing in large-scale healthcare implementations. Former Director of Operations at Mayo Clinic with expertise in process optimization.',
    specialties: ['Operations Management', 'Technology Integration', 'Process Optimization', 'Change Management'],
    education: ['MS, Industrial Engineering, Stanford', 'BS, Systems Engineering, MIT'],
    certifications: ['Project Management Professional (PMP)', 'Certified Business Analysis Professional (CBAP)'],
    achievements: [
      'Implemented EHR systems across 15+ health systems',
      'Reduced operational costs by $50M+ across client portfolio',
      'Speaker at 25+ healthcare conferences annually'
    ],
    linkedin: '#',
    email: 'michael@teamx.healthcare'
  },
  {
    name: 'Dr. Jennifer Walsh',
    role: 'Chief Medical Officer',
    image: '/images/team/jennifer-walsh.jpg',
    bio: 'Physician executive and quality improvement expert with deep clinical operations experience. Former Chief Quality Officer at Cleveland Clinic.',
    specialties: ['Clinical Operations', 'Quality Improvement', 'Patient Safety', 'Value-Based Care'],
    education: ['MD, Johns Hopkins School of Medicine', 'MPH, Harvard T.H. Chan School'],
    certifications: ['Board Certified Internal Medicine', 'Certified Physician Executive (CPE)'],
    achievements: [
      'Improved patient safety scores by 40% at Cleveland Clinic',
      'Published 50+ peer-reviewed articles on healthcare quality',
      'Led implementation of value-based care models across 8 states'
    ],
    linkedin: '#',
    email: 'jennifer@teamx.healthcare'
  },
  {
    name: 'David Park',
    role: 'Chief Financial Officer',
    image: '/images/team/david-park.jpg',
    bio: 'Healthcare finance executive with expertise in revenue cycle optimization and financial turnarounds. Former CFO of regional health systems.',
    specialties: ['Healthcare Finance', 'Revenue Cycle', 'Financial Analysis', 'Strategic Planning'],
    education: ['MBA, Finance, Northwestern Kellogg', 'BS, Accounting, University of Chicago'],
    certifications: ['CPA', 'Certified Healthcare Financial Professional (CHFP)'],
    achievements: [
      'Improved revenue cycle performance by 35% across client base',
      'Led financial turnarounds resulting in $100M+ savings',
      'Expert witness in healthcare finance litigation'
    ],
    linkedin: '#',
    email: 'david@teamx.healthcare'
  },
  {
    name: 'Lisa Thompson',
    role: 'Director of Analytics & Insights',
    image: '/images/team/lisa-thompson.jpg',
    bio: 'Data science and analytics leader with expertise in healthcare predictive modeling and business intelligence. Former analytics director at Epic Systems.',
    specialties: ['Healthcare Analytics', 'Predictive Modeling', 'Business Intelligence', 'Data Visualization'],
    education: ['PhD, Biostatistics, University of Washington', 'MS, Computer Science, Carnegie Mellon'],
    certifications: ['Certified Analytics Professional (CAP)', 'Six Sigma Black Belt'],
    achievements: [
      'Built predictive models improving patient outcomes by 25%',
      'Led analytics initiatives for 200+ healthcare organizations',
      'Published research in New England Journal of Medicine'
    ],
    linkedin: '#',
    email: 'lisa@teamx.healthcare'
  },
  {
    name: 'Robert Kim',
    role: 'Director of Change Management',
    image: '/images/team/robert-kim.jpg',
    bio: 'Organizational development and change management expert with focus on healthcare culture transformation. Former VP of Human Resources at Kaiser Permanente.',
    specialties: ['Change Management', 'Leadership Development', 'Culture Transformation', 'Employee Engagement'],
    education: ['MS, Organizational Psychology, Columbia', 'BS, Business Administration, UC Berkeley'],
    certifications: ['Certified Change Management Professional (CCMP)', 'Society for Human Resource Management (SHRM-SCP)'],
    achievements: [
      'Led culture transformation for 50+ healthcare organizations',
      'Improved employee engagement scores by average of 45%',
      'Developed proprietary change management methodology'
    ],
    linkedin: '#',
    email: 'robert@teamx.healthcare'
  }
]

const advisoryBoard = [
  {
    name: 'Dr. Margaret Stevens',
    role: 'Former CEO, Mass General Brigham',
    image: '/images/advisors/margaret-stevens.jpg',
    bio: 'Healthcare industry veteran with 30+ years of executive leadership experience in academic medical centers and integrated health systems.',
    expertise: ['Healthcare Strategy', 'Academic Medicine', 'System Integration'],
    linkedin: '#'
  },
  {
    name: 'Thomas Anderson',
    role: 'Former CTO, Epic Systems',
    image: '/images/advisors/thomas-anderson.jpg',
    bio: 'Technology leader who guided Epic\'s growth from startup to market leader. Expert in healthcare IT strategy and implementation.',
    expertise: ['Healthcare Technology', 'Software Development', 'Digital Innovation'],
    linkedin: '#'
  },
  {
    name: 'Dr. Patricia Williams',
    role: 'Former Chief Medical Officer, Humana',
    image: '/images/advisors/patricia-williams.jpg',
    bio: 'Physician executive with deep experience in value-based care, population health, and healthcare quality improvement.',
    expertise: ['Value-Based Care', 'Population Health', 'Quality Improvement'],
    linkedin: '#'
  },
  {
    name: 'James Mitchell',
    role: 'Healthcare Investment Partner, KKR',
    image: '/images/advisors/james-mitchell.jpg',
    bio: 'Healthcare investor and strategic advisor with experience in private equity and healthcare services growth strategies.',
    expertise: ['Healthcare Investment', 'Growth Strategy', 'M&A'],
    linkedin: '#'
  }
]

const cultureValues = [
  {
    title: 'Client-Centric Excellence',
    description: 'We obsess over delivering exceptional value and measurable outcomes for our healthcare clients.',
    icon: HeartIcon,
    examples: ['95% client retention rate', 'Average 425% ROI for clients', '24/7 client support availability']
  },
  {
    title: 'Innovation & Continuous Learning',
    description: 'We embrace emerging technologies and methodologies to stay at the forefront of healthcare consulting.',
    icon: LightBulbIcon,
    examples: ['Monthly innovation workshops', '$50K annual learning budget per employee', 'Patent applications filed']
  },
  {
    title: 'Integrity & Transparency',
    description: 'We maintain the highest ethical standards and provide transparent communication in all our engagements.',
    icon: ShieldCheckIcon,
    examples: ['100% ethical compliance record', 'Open-book pricing model', 'Regular ethics training']
  },
  {
    title: 'Collaborative Excellence',
    description: 'We work as one team internally and partner closely with clients to achieve transformational results.',
    icon: UserGroupIcon,
    examples: ['Cross-functional project teams', 'Client co-location programs', 'Team success bonuses']
  }
]

const careerOpportunities = [
  {
    title: 'Senior Healthcare Consultant',
    department: 'Operations',
    location: 'Remote / Travel',
    type: 'Full-time',
    experience: '5-8 years',
    description: 'Lead healthcare transformation projects with focus on operational excellence and process optimization.',
    requirements: [
      'Healthcare consulting or operations experience',
      'MBA or advanced degree preferred',
      'Strong analytical and project management skills',
      'Willingness to travel 50-75%'
    ]
  },
  {
    title: 'Data Scientist - Healthcare Analytics',
    department: 'Analytics',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 years',
    description: 'Develop predictive models and analytics solutions to drive healthcare insights and decision-making.',
    requirements: [
      'PhD or MS in Statistics, Data Science, or related field',
      'Experience with healthcare data and EHR systems',
      'Proficiency in Python, R, and SQL',
      'Machine learning and statistical modeling expertise'
    ]
  },
  {
    title: 'Change Management Specialist',
    department: 'Strategy',
    location: 'Hybrid',
    type: 'Full-time',
    experience: '4-7 years',
    description: 'Design and execute change management strategies for large-scale healthcare transformations.',
    requirements: [
      'Change management certification (CCMP preferred)',
      'Healthcare industry experience',
      'Excellent communication and facilitation skills',
      'Experience with organizational development'
    ]
  },
  {
    title: 'Healthcare Technology Consultant',
    department: 'Technology',
    location: 'Remote / Travel',
    type: 'Full-time',
    experience: '4-6 years',
    description: 'Lead technology implementations and digital transformation initiatives for healthcare organizations.',
    requirements: [
      'Healthcare IT or EHR implementation experience',
      'Technical background in software systems',
      'Project management certification preferred',
      'Strong client-facing communication skills'
    ]
  }
]

const benefits = [
  'Competitive salary and performance bonuses',
  'Comprehensive health, dental, and vision coverage',
  'Unlimited PTO and flexible work arrangements',
  '$50,000 annual professional development budget',
  'Equity participation in company growth',
  'Premium travel accommodations and per diem',
  'Home office setup allowance',
  'Mental health and wellness programs'
]

export default function Team() {
  const [selectedMember, setSelectedMember] = useState(teamMembers[0])
  const [showJobDetails, setShowJobDetails] = useState<number | null>(null)

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
            Our Team
          </h1>
          <p className="mt-6 text-xl leading-8 text-teamx-warm-gray max-w-3xl mx-auto">
            Meet the healthcare transformation experts who deliver exceptional results 
            through deep domain knowledge, proven methodologies, and unwavering commitment to client success.
          </p>
        </motion.div>
      </section>

      {/* Leadership Team */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <UsersIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Leadership Team
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Our leadership combines 150+ years of healthcare experience with proven track records 
              of delivering transformational results for healthcare organizations.
            </p>
          </motion.div>

          {/* Team Member Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {teamMembers.slice(0, 3).map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-teamx-charcoal mb-2">
                    {member.name}
                  </h3>
                  <p className="text-teamx-navy font-medium mb-4">
                    {member.role}
                  </p>
                </div>
                
                <p className="text-teamx-warm-gray mb-6 leading-relaxed">
                  {member.bio.substring(0, 150)}...
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-teamx-charcoal">Specialties:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.specialties.slice(0, 2).map(specialty => (
                      <span key={specialty} className="px-2 py-1 bg-teamx-navy text-white text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                    {member.specialties.length > 2 && (
                      <span className="px-2 py-1 bg-teamx-background text-teamx-warm-gray text-xs rounded-full">
                        +{member.specialties.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <a href={member.linkedin} className="text-teamx-navy hover:text-teamx-blue transition-colors duration-200">
                      <LinkIcon className="h-5 w-5" />
                    </a>
                    <a href={`mailto:${member.email}`} className="text-teamx-navy hover:text-teamx-blue transition-colors duration-200">
                      <EnvelopeIcon className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.slice(3).map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 p-6 rounded-2xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-teamx-charcoal mb-1">
                      {member.name}
                    </h3>
                    <p className="text-teamx-navy font-medium text-sm mb-2">
                      {member.role}
                    </p>
                    <p className="text-teamx-warm-gray text-sm mb-3">
                      {member.bio.substring(0, 100)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.slice(0, 2).map(specialty => (
                        <span key={specialty} className="px-2 py-1 bg-teamx-background text-teamx-slate text-xs rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <AcademicCapIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Advisory Board
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Strategic guidance from healthcare industry leaders who provide deep insights 
              and expertise across key areas of healthcare transformation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advisoryBoard.map((advisor, index) => (
              <motion.div
                key={advisor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-teamx-health-teal to-teamx-trust-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-white">
                      {advisor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-teamx-charcoal mb-1">
                    {advisor.name}
                  </h3>
                  <p className="text-teamx-navy font-medium text-sm mb-3">
                    {advisor.role}
                  </p>
                </div>
                
                <p className="text-teamx-warm-gray text-sm mb-4 leading-relaxed">
                  {advisor.bio}
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-3">
                    <span className="text-xs font-medium text-teamx-charcoal">Expertise:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {advisor.expertise.map(area => (
                      <span key={area} className="px-2 py-1 bg-teamx-background text-teamx-slate text-xs rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                  
                  <a href={advisor.linkedin} className="text-teamx-navy hover:text-teamx-blue transition-colors duration-200">
                    <LinkIcon className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <SparklesIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Our Culture & Values
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Our values drive everything we do and create an environment where exceptional 
              professionals can do their best work while delivering transformational client results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl shadow-soft"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-teamx-charcoal mb-2">
                      {value.title}
                    </h3>
                    <p className="text-teamx-warm-gray leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-teamx-charcoal mb-3">How we live this value:</h4>
                  <ul className="space-y-2">
                    {value.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-teamx-trust-green mt-2 flex-shrink-0" />
                        <span className="text-teamx-warm-gray text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Opportunities */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <RocketLaunchIcon className="h-12 w-12 text-teamx-navy mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-teamx-charcoal sm:text-4xl">
              Join Our Team
            </h2>
            <p className="mt-4 text-lg text-teamx-warm-gray max-w-2xl mx-auto">
              Build your career with a fast-growing healthcare consulting firm that values 
              professional development, work-life balance, and meaningful impact.
            </p>
          </motion.div>

          {/* Job Openings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {careerOpportunities.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-soft hover:shadow-professional transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-teamx-charcoal mb-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-teamx-warm-gray mb-4">
                      <span className="flex items-center">
                        <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                        {job.department}
                      </span>
                      <span className="flex items-center">
                        <GlobeAmericasIcon className="h-4 w-4 mr-1" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        {job.experience}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-teamx-navy text-white text-xs rounded-full">
                    {job.type}
                  </span>
                </div>

                <p className="text-teamx-warm-gray mb-6 leading-relaxed">
                  {job.description}
                </p>

                {showJobDetails === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 pt-4 mb-6"
                  >
                    <h4 className="font-medium text-teamx-charcoal mb-3">Requirements:</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((requirement, reqIndex) => (
                        <li key={reqIndex} className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-teamx-trust-green mt-2 flex-shrink-0" />
                          <span className="text-teamx-warm-gray text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={() => setShowJobDetails(showJobDetails === index ? null : index)}
                    className="text-teamx-navy hover:text-teamx-blue font-medium text-sm transition-colors duration-200"
                  >
                    {showJobDetails === index ? 'Hide Details' : 'View Details'}
                  </motion.button>
                  <motion.a
                    href={`mailto:careers@teamx.healthcare?subject=Application for ${job.title}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
                  >
                    Apply Now
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits & Perks */}
          <div className="bg-white p-8 rounded-3xl shadow-soft">
            <h3 className="text-2xl font-semibold text-teamx-charcoal mb-8 text-center">
              Benefits & Perks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="flex items-start space-x-3 p-4 rounded-xl hover:bg-teamx-background transition-colors duration-200"
                >
                  <TrophyIcon className="h-5 w-5 text-teamx-trust-green mt-0.5 flex-shrink-0" />
                  <span className="text-teamx-warm-gray text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
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
              Ready to Make an Impact?
            </h2>
            <p className="mt-6 text-lg text-blue-200 max-w-2xl mx-auto">
              Join a team of healthcare transformation experts who are passionate about 
              improving healthcare delivery and creating meaningful change in the industry.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="mailto:careers@teamx.healthcare"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teamx-navy bg-white rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
              >
                Explore Opportunities
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-teamx-navy transition-all duration-200"
              >
                Connect With Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}