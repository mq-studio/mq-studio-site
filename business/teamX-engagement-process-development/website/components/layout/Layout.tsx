'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import Footer from './Footer'
import ScrollProgress from '@/components/ui/ScrollProgress'
import Loading from '@/components/ui/Loading'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Navigation Links */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-teamx-navy text-white px-4 py-2 z-50 focus:z-50"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-32 bg-teamx-navy text-white px-4 py-2 z-50 focus:z-50"
        aria-label="Skip to navigation"
      >
        Skip to navigation
      </a>
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loading key="loading" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col"
          >
            <ScrollProgress />
            <Header 
              mobileMenuOpen={mobileMenuOpen} 
              setMobileMenuOpen={setMobileMenuOpen} 
            />
            <main id="main-content" className="flex-grow" role="main" aria-label="Main content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={typeof window !== 'undefined' ? window.location.pathname : 'default'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}