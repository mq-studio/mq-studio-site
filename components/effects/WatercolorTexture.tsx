'use client';

import { useEffect, useRef } from 'react';

/**
 * WatercolorTexture Component
 *
 * Adds a subtle paper-like texture overlay to create a watercolor paper effect.
 * Uses canvas to generate organic noise patterns with a very gentle breathing animation.
 *
 * Features:
 * - 3% opacity for subtlety
 * - Organic noise pattern resembling cold-press watercolor paper
 * - Gentle breathing animation (0.5s cycle)
 * - Performance optimized with requestAnimationFrame
 * - Does not interfere with content readability
 */
export default function WatercolorTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawTexture();
    };

    // Generate watercolor paper texture
    const drawTexture = () => {
      if (!ctx) return;

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Create organic noise pattern
      for (let i = 0; i < data.length; i += 4) {
        // Generate multiple layers of noise for organic feel
        const noise1 = Math.random() * 255;
        const noise2 = Math.random() * 128;
        const noise3 = Math.random() * 64;

        // Combine noise layers with different weights
        const value = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.3);

        // Apply subtle grain
        const grain = value > 200 ? value : value * 0.8;

        // Warm tone to match rice paper background
        data[i] = grain; // R
        data[i + 1] = grain * 0.98; // G (slightly less green)
        data[i + 2] = grain * 0.95; // B (slightly less blue)
        data[i + 3] = 255; // Full alpha (opacity controlled by CSS)
      }

      ctx.putImageData(imageData, 0, 0);
    };

    // Gentle breathing animation
    let startTime = Date.now();
    const breathingCycle = 8000; // 8 seconds for full breath cycle

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % breathingCycle) / breathingCycle;

      // Sine wave for smooth breathing effect
      // Oscillates between 0.97 and 1.0 (very subtle)
      const breathe = 0.97 + Math.sin(progress * Math.PI * 2) * 0.015;

      if (canvas) {
        canvas.style.transform = `scale(${breathe})`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="watercolor-texture"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.03,
        mixBlendMode: 'multiply',
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    />
  );
}
