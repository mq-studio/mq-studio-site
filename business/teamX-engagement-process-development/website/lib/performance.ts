// Performance optimization utilities

export const animationConfig = {
  // Optimized animation settings for better performance
  reduced: {
    type: "tween" as const,
    ease: "easeOut" as const,
    duration: 0.3,
  },
  normal: {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.5,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
}

// Intersection Observer options for lazy loading
export const observerOptions: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '50px 0px',
}

// Optimized motion variants for common animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.1 },
}

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Performance-optimized hover effects
export const hoverScale = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
}

// Prefers reduced motion detection
export const respectsReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

// Optimized motion props based on user preferences
export const getMotionProps = (variants: any, transition?: any) => {
  const reducedMotion = respectsReducedMotion()
  
  if (reducedMotion) {
    return {
      initial: false,
      animate: variants.animate,
      transition: { duration: 0.01 } // Nearly instant for users who prefer reduced motion
    }
  }
  
  return {
    initial: variants.initial,
    animate: variants.animate,
    exit: variants.exit,
    transition: transition || animationConfig.normal,
  }
}