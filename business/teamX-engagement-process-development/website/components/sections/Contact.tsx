'use client'

import { useState } from 'react'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const contactInfo = [
  {
    name: 'Email',
    value: 'hello@teamx-consulting.com',
    icon: EnvelopeIcon,
    href: 'mailto:hello@teamx-consulting.com',
  },
  {
    name: 'Phone',
    value: '+1 (555) 123-4567',
    icon: PhoneIcon,
    href: 'tel:+15551234567',
  },
  {
    name: 'Office',
    value: 'Toronto, ON, Canada',
    icon: MapPinIcon,
    href: '#',
  },
  {
    name: 'Business Hours',
    value: 'Mon-Fri 9AM-5PM EST',
    icon: ClockIcon,
    href: '#',
  },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    console.log('Form submitted:', formData)
  }

  return (
    <section id="contact" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-teamx-navy">Contact Us</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Let&apos;s Start Your Transformation
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            Ready to take your healthcare organization to the next level? 
            Get in touch with our team of experts today.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-teamx-charcoal">
                Get in Touch
              </h3>
              <p className="mt-4 text-lg leading-8 text-teamx-warm-gray">
                We&apos;d love to hear about your challenges and discuss how we can help 
                transform your organization.
              </p>

              <dl className="mt-10 space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.name} className="flex gap-x-4">
                    <dt className="flex-none">
                      <span className="sr-only">{item.name}</span>
                      <item.icon className="h-7 w-6 text-teamx-navy" aria-hidden="true" />
                    </dt>
                    <dd>
                      <span className="text-sm font-semibold leading-6 text-teamx-charcoal">
                        {item.name}
                      </span>
                      <br />
                      {item.href && item.href !== '#' ? (
                        <a
                          href={item.href}
                          className="text-teamx-warm-gray hover:text-teamx-navy transition-colors duration-200"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="text-teamx-warm-gray">{item.value}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 p-6 bg-teamx-background rounded-lg ring-1 ring-teamx-light-slate/20">
                <h4 className="text-lg font-semibold text-teamx-charcoal mb-3">
                  Why Choose TeamX?
                </h4>
                <ul className="space-y-2 text-sm text-teamx-warm-gray">
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-teamx-trust-green mr-3 mt-2 flex-shrink-0" />
                    15+ years of healthcare consulting expertise
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-teamx-trust-green mr-3 mt-2 flex-shrink-0" />
                    Proven track record with 100+ organizations
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-teamx-trust-green mr-3 mt-2 flex-shrink-0" />
                    Average 250% ROI improvement for clients
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-teamx-trust-green mr-3 mt-2 flex-shrink-0" />
                    Comprehensive end-to-end solutions
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-teamx-background p-8 rounded-2xl ring-1 ring-teamx-light-slate/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-teamx-charcoal">
                      First name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-teamx-charcoal shadow-sm ring-1 ring-inset ring-teamx-light-slate/30 placeholder:text-teamx-warm-gray focus:ring-2 focus:ring-inset focus:ring-teamx-navy sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-teamx-charcoal">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-teamx-charcoal shadow-sm ring-1 ring-inset ring-teamx-light-slate/30 placeholder:text-teamx-warm-gray focus:ring-2 focus:ring-inset focus:ring-teamx-navy sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-teamx-charcoal">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-teamx-charcoal shadow-sm ring-1 ring-inset ring-teamx-light-slate/30 placeholder:text-teamx-warm-gray focus:ring-2 focus:ring-inset focus:ring-teamx-navy sm:text-sm sm:leading-6"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium leading-6 text-teamx-charcoal">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="company"
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-teamx-charcoal shadow-sm ring-1 ring-inset ring-teamx-light-slate/30 placeholder:text-teamx-warm-gray focus:ring-2 focus:ring-inset focus:ring-teamx-navy sm:text-sm sm:leading-6"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium leading-6 text-teamx-charcoal">
                    Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-2 block w-full rounded-md border-0 px-3.5 py-2 text-teamx-charcoal shadow-sm ring-1 ring-inset ring-teamx-light-slate/30 placeholder:text-teamx-warm-gray focus:ring-2 focus:ring-inset focus:ring-teamx-navy sm:text-sm sm:leading-6"
                    placeholder="Tell us about your organization's challenges and goals..."
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-professional hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}