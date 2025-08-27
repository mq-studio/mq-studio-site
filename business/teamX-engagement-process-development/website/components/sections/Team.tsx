'use client'

import { motion } from 'framer-motion'
import { LinkedinIcon, MailIcon } from 'lucide-react'

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    role: 'Managing Director',
    specialty: 'Healthcare Strategy & Operations',
    bio: 'Former Chief Strategy Officer at major health systems with 15+ years transforming healthcare organizations.',
    credentials: 'MD, MBA',
    image: '/images/team/sarah-mitchell.jpg',
    linkedin: 'https://linkedin.com/in/sarahmitchell',
    email: 'sarah@teamx-consulting.com'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Senior Partner',
    specialty: 'Digital Transformation & Analytics',
    bio: 'Technology leader specializing in healthcare digital innovation and data-driven operational excellence.',
    credentials: 'MS Engineering, PMP',
    image: '/images/team/michael-chen.jpg',
    linkedin: 'https://linkedin.com/in/michaelchen',
    email: 'michael@teamx-consulting.com'
  },
  {
    id: 3,
    name: 'Dr. Amanda Rodriguez',
    role: 'Clinical Excellence Director',
    specialty: 'Quality Improvement & Patient Safety',
    bio: 'Board-certified physician with expertise in clinical operations optimization and quality management.',
    credentials: 'MD, Six Sigma Black Belt',
    image: '/images/team/amanda-rodriguez.jpg',
    linkedin: 'https://linkedin.com/in/amandarodriguez',
    email: 'amanda@teamx-consulting.com'
  },
  {
    id: 4,
    name: 'James Patterson',
    role: 'Financial Strategy Lead',
    specialty: 'Healthcare Finance & Value Creation',
    bio: 'Former healthcare CFO with deep expertise in financial optimization and investment strategy.',
    credentials: 'CPA, MBA Finance',
    image: '/images/team/james-patterson.jpg',
    linkedin: 'https://linkedin.com/in/jamespatterson',
    email: 'james@teamx-consulting.com'
  }
]

const stats = [
  { label: 'Combined Years of Experience', value: '60+' },
  { label: 'Healthcare Organizations Served', value: '150+' },
  { label: 'Team Certifications', value: '25+' },
  { label: 'Industry Recognition Awards', value: '12' }
]

export default function Team() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-teamx-blue">Our Team</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Healthcare Excellence Leaders
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            Our diverse team of healthcare experts brings decades of combined experience in transforming healthcare organizations across North America.
          </p>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <dt className="text-base leading-7 text-teamx-warm-gray">{stat.label}</dt>
                <dd className="text-3xl font-bold leading-9 tracking-tight text-teamx-navy sm:text-4xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>

        {/* Team Members */}
        <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-professional transition-all duration-300 border border-slate-100">
                <div className="flex items-start space-x-6">
                  {/* Photo placeholder */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teamx-navy to-teamx-blue flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-teamx-charcoal group-hover:text-teamx-blue transition-colors duration-200">
                      {member.name}
                    </h3>
                    <p className="text-teamx-blue font-medium mt-1">
                      {member.role}
                    </p>
                    <p className="text-sm text-teamx-slate mt-1">
                      {member.credentials}
                    </p>
                    
                    <div className="mt-3 mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-medium text-teamx-navy bg-blue-50 rounded-full">
                        {member.specialty}
                      </span>
                    </div>
                    
                    <p className="text-teamx-warm-gray text-sm leading-relaxed">
                      {member.bio}
                    </p>
                    
                    {/* Contact links */}
                    <div className="flex space-x-4 mt-4">
                      <motion.a
                        href={member.linkedin}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-teamx-slate hover:text-teamx-blue transition-colors duration-200"
                      >
                        <LinkedinIcon className="h-5 w-5" />
                      </motion.a>
                      <motion.a
                        href={`mailto:${member.email}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-teamx-slate hover:text-teamx-blue transition-colors duration-200"
                      >
                        <MailIcon className="h-5 w-5" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Extended Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center bg-white rounded-2xl p-8 shadow-soft border border-slate-100"
        >
          <h3 className="text-xl font-semibold text-teamx-charcoal mb-3">
            Extended Network of Specialists
          </h3>
          <p className="text-teamx-warm-gray mb-6 max-w-2xl mx-auto">
            Beyond our core team, we maintain relationships with a network of 50+ healthcare specialists, 
            ensuring we can provide the right expertise for every engagement.
          </p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-3 text-base font-semibold text-white bg-gradient-primary rounded-xl shadow-professional hover:shadow-lg transition-all duration-200"
          >
            Meet Our Team
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}