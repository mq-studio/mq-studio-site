'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid'

const testimonials = [
  {
    id: 1,
    content: "TeamX transformed our entire operation. Their strategic approach and hands-on implementation resulted in a 40% improvement in operational efficiency and significantly better patient outcomes. The ROI was evident within the first quarter.",
    author: "Dr. Jennifer Walsh",
    role: "CEO",
    company: "Regional Medical Center",
    location: "Toronto, ON",
    rating: 5,
    metric: "40% efficiency improvement",
    image: "/images/testimonials/jennifer-walsh.jpg"
  },
  {
    id: 2,
    content: "Working with TeamX was a game-changer for our multi-site expansion. Their expertise in healthcare operations and strategic planning helped us scale from 3 to 15 locations while maintaining quality and profitability.",
    author: "Mark Thompson",
    role: "Managing Partner",
    company: "Advanced Healthcare Solutions",
    location: "Vancouver, BC",
    rating: 5,
    metric: "500% location growth",
    image: "/images/testimonials/mark-thompson.jpg"
  },
  {
    id: 3,
    content: "The digital transformation roadmap TeamX developed for us was exceptional. They didn't just provide recommendations – they stayed with us through implementation, ensuring every system worked seamlessly together.",
    author: "Dr. Priya Sharma",
    role: "Chief Medical Officer",
    company: "Integrated Health Network",
    location: "Calgary, AB",
    rating: 5,
    metric: "75% process digitization",
    image: "/images/testimonials/priya-sharma.jpg"
  },
  {
    id: 4,
    content: "TeamX's financial optimization strategies saved our organization over $2.3M annually while improving patient care quality. Their approach to value-based care implementation was particularly impressive.",
    author: "Robert Chen",
    role: "CFO",
    company: "Metropolitan Health Group",
    location: "Montreal, QC",
    rating: 5,
    metric: "$2.3M annual savings",
    image: "/images/testimonials/robert-chen.jpg"
  }
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    )
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((current) => (current + 1) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-teamx-blue">Client Testimonials</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-teamx-charcoal sm:text-4xl">
            Trusted by Healthcare Leaders
          </p>
          <p className="mt-6 text-lg leading-8 text-teamx-warm-gray">
            Discover what healthcare executives say about their transformation journey with TeamX.
          </p>
        </motion.div>

        <div className="relative mx-auto mt-16 max-w-4xl">
          {/* Main testimonial */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 p-8 lg:p-12">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl font-medium text-teamx-charcoal leading-relaxed mb-8">
                &ldquo;{testimonials[currentIndex].content}&rdquo;
              </blockquote>

              {/* Metric highlight */}
              <div className="inline-block px-6 py-2 bg-teamx-blue/10 rounded-full mb-6">
                <span className="text-teamx-blue font-semibold">
                  {testimonials[currentIndex].metric}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                {/* Avatar placeholder */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teamx-navy to-teamx-blue flex items-center justify-center text-white text-lg font-bold">
                  {testimonials[currentIndex].author.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-teamx-charcoal">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-teamx-blue font-medium">
                    {testimonials[currentIndex].role}
                  </div>
                  <div className="text-teamx-warm-gray text-sm">
                    {testimonials[currentIndex].company}, {testimonials[currentIndex].location}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Previous button */}
            <motion.button
              onClick={goToPrevious}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white shadow-soft hover:shadow-professional border border-slate-100 text-teamx-slate hover:text-teamx-blue transition-all duration-200"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </motion.button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-teamx-blue scale-125' 
                      : 'bg-slate-300 hover:bg-teamx-blue/50'
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            <motion.button
              onClick={goToNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white shadow-soft hover:shadow-professional border border-slate-100 text-teamx-slate hover:text-teamx-blue transition-all duration-200"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Client logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <h3 className="text-center text-lg font-semibold text-teamx-warm-gray mb-8">
            Trusted by Leading Healthcare Organizations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* Client logo placeholders */}
            {['Regional Health', 'MediCorp', 'HealthTech', 'CareNet', 'MedGroup', 'HealthPlus'].map((client, index) => (
              <motion.div
                key={client}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-medium text-sm">
                  {client}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}