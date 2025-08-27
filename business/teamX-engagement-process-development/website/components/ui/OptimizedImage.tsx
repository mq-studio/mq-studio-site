'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string
  className?: string
}

export default function OptimizedImage({ 
  src, 
  alt, 
  fallback = '/images/placeholder.jpg',
  className = '',
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      <Image
        {...props}
        src={hasError ? fallback : imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
          setImgSrc(fallback)
        }}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
      />
    </div>
  )
}