/**
 * Design Tokens from Google Stitch - Battleship Game Lobby
 * 
 * Theme Configuration:
 * - Color Mode: Dark
 * - Primary Color: #195de6
 * - Font: BE Vietnam Pro
 * - Roundness: 8px
 * - Saturation: Level 3
 */

export const designTokens = {
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: '#195de6',
      50: '#e6eeff',
      100: '#ccdcff',
      200: '#99b9ff',
      300: '#6695ff',
      400: '#3372ff',
      500: '#195de6', // Base
      600: '#144bb8',
      700: '#0f398a',
      800: '#0a275c',
      900: '#05152e',
    },
    
    // Dark theme backgrounds
    background: {
      DEFAULT: '#0a0e1a',
      dark: '#050810',
      card: '#111827',
      'card-hover': '#1f2937',
    },
    
    // Text colors for dark theme
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      muted: '#9ca3af',
      accent: '#60a5fa',
    },
    
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Grid colors for battleship
    grid: {
      ocean: '#1e3a5f',
      hit: '#ef4444',
      miss: '#60a5fa',
      ship: '#6366f1',
    },
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    DEFAULT: '8px',  // Stitch roundness setting
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  typography: {
    fontFamily: {
      sans: ['BE Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
    glow: '0 0 20px rgba(25, 93, 230, 0.5)',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
