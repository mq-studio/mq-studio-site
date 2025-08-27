'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TeamX
          </span>
        </motion.div>

        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-teamx-navy to-teamx-blue rounded-full"
              animate={{
                y: [-10, 0, -10],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-teamx-warm-gray"
        >
          Loading healthcare excellence...
        </motion.p>
      </div>
    </div>
  )
}