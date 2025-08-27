'use client'

import { useEffect, useState } from 'react'
import { XMarkIcon, ArrowDownTrayIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline'

interface FrameworkViewerProps {
  frameworkId: string
  onClose: () => void
}

const frameworkData = {
  'integrated-master-framework': {
    title: 'Integrated Master Framework',
    description: 'Complete system architecture for Canadian healthcare network scaling',
    filename: 'integrated-master-framework.html'
  },
  'operational-alpha-canvas': {
    title: 'Operational Alpha™ Canvas',
    description: 'Healthcare automation architecture and efficiency optimization',
    filename: 'operational-alpha-canvas.html'
  },
  'realtime-value-dashboard': {
    title: 'Real-time Value Dashboard',
    description: 'Live metrics and performance tracking system',
    filename: 'realtime-value-dashboard.html'
  },
  'network-effects-canvas': {
    title: 'Network Effects Canvas',
    description: 'Scalable network value creation and amplification',
    filename: 'network-effects-canvas.html'
  },
  'data-capital-framework': {
    title: 'Data Capital Framework',
    description: 'Data monetization and value extraction strategies',
    filename: 'data-capital-framework.html'
  }
}

export default function FrameworkViewer({ frameworkId, onClose }: FrameworkViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const framework = frameworkData[frameworkId as keyof typeof frameworkData]

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen, onClose])

  const handleDownload = () => {
    // Create a link to download the framework
    const link = document.createElement('a')
    link.href = `/frameworks/${framework.filename}`
    link.download = framework.filename
    link.click()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!framework) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-4'
      }`}>
        <div className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-6xl max-h-[90vh] rounded-lg'
        }`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-teamx-charcoal">
                {framework.title}
              </h2>
              <p className="text-sm text-teamx-slate mt-1">
                {framework.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 text-teamx-slate hover:text-teamx-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                title="Download Framework"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 text-teamx-slate hover:text-teamx-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                title="Toggle Fullscreen"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-teamx-slate hover:text-teamx-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Framework Content */}
          <div className={`transition-all duration-300 ${
            isFullscreen ? 'h-[calc(100vh-73px)]' : 'h-96 lg:h-[600px]'
          }`}>
            <iframe
              src={`/frameworks/${framework.filename}`}
              className="w-full h-full border-0"
              title={framework.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          
          {/* Footer */}
          {!isFullscreen && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-teamx-slate">
                  Part of the TeamX Framework Ecosystem
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-teamx-navy text-white text-sm font-medium rounded-lg hover:bg-teamx-navy/90 transition-colors"
                  >
                    Download Framework
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}