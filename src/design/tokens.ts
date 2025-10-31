/**
 * Design tokens for MQ Studio
 * Based on specs/001-homepage-hero/spec.md color system requirements
 */

export const TOKENS = {
  colors: {
    mouraTeal: '#00A8A8',
    livingPink: '#E91E63',
    scholarBlue: '#2C5985',
    ricePaper: '#FDFCF8',
    shufaRed: '#8D2305',
    inkBlack: '#1A1A1A',
    studioCream: '#FFF8F0',
    charcoalWash: '#4A4A4A',
    lightGray: '#D8D5CC',
    springYellow: '#F4B942',
    sageWisdom: '#7A9A82',
  },
  fonts: {
    heading: 'Montserrat',
    body: 'Lora',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    base: '8px',
    sm: '4px',
    lg: '12px',
  },
  focus: {
    ring: '#00A8A8',
  },
} as const;

export type TokenKeys = keyof typeof TOKENS;
export type ColorKeys = keyof typeof TOKENS.colors;
export type FontKeys = keyof typeof TOKENS.fonts;