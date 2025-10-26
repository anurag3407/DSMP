// Theme configuration with exact color values and design tokens
export const theme = {
  // Colors
  colors: {
    primary: '#65d3c6',
    primaryDark: '#169C96',
    accent: '#9C95C8',
    accentLight: '#CAC5E2',
    background: '#F8F9FF',
    white: '#FFFFFF',
    textDark: '#25272B',
    textBold: '#000000',
    textInfo: '#0B346C',
    textGray: '#6B7280',
    textSilver: '#9CA3AF',
    border: 'rgba(107, 114, 128, 0.2)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },

  // Spacing (8px base)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    xxxxl: '48px',
  },

  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '22px',
      xxxl: '26px',
      xxxxl: '34px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '14px',
    xl: '18px',
    circle: '50%',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Component Sizes
  sizes: {
    header: '70px',
    sidebar: '290px',
    sidebarCollapsed: '84px',
    postCard: '580px',
    loginCard: '420px',
    avatar: {
      xs: '24px',
      sm: '42px',
      md: '48px',
      lg: '84px',
      xl: '104px',
    },
    button: {
      sm: '32px',
      md: '38px',
      lg: '42px',
      xl: '44px',
    },
    input: '42px',
  },

  // Breakpoints
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    toast: 1060,
  },
};

// CSS-in-JS helper
export const getThemeValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

export default theme;
