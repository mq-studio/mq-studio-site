'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teamx-primary/5 to-teamx-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center px-4 max-w-2xl mx-auto"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-teamx-primary/20 mb-4">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teamx-primary to-teamx-secondary mx-auto rounded-full"></div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-teamx-text mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-teamx-text/70 mb-6">
            Oops! The page you&apos;re looking for seems to have moved or doesn&apos;t exist. 
            Don&apos;t worry, even the best healthcare systems sometimes need a redirect.
          </p>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="group flex items-center px-6 py-3 bg-teamx-primary text-white rounded-lg hover:bg-teamx-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <HomeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Return Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group flex items-center px-6 py-3 border-2 border-teamx-primary text-teamx-primary rounded-lg hover:bg-teamx-primary hover:text-white transition-all duration-300"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Go Back
          </button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-teamx-primary/20"
        >
          <p className="text-teamx-text/60 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/services"
              className="text-teamx-primary hover:text-teamx-secondary transition-colors underline underline-offset-4"
            >
              Our Services
            </Link>
            <Link
              href="/about"
              className="text-teamx-primary hover:text-teamx-secondary transition-colors underline underline-offset-4"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-teamx-primary hover:text-teamx-secondary transition-colors underline underline-offset-4"
            >
              Contact
            </Link>
            <Link
              href="/case-studies"
              className="text-teamx-primary hover:text-teamx-secondary transition-colors underline underline-offset-4"
            >
              Case Studies
            </Link>
          </div>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-10 -left-10 w-20 h-20 bg-teamx-primary/5 rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-10 -right-10 w-32 h-32 bg-teamx-secondary/5 rounded-full"
          />
        </div>
      </motion.div>
    </div>
  )
}