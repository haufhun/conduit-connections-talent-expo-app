/**
 * Conduit Brand Colors
 *
 * These colors are defined in the Tailwind config and can be used throughout the app.
 * Use these constants for consistent color usage in your React Native components.
 */

export const BrandColors = {
  // Main Brand Colors
  PRIMARY: "#5DE0E6", // Light Blue - Primary brand color
  SECONDARY: "#004AAD", // Dark Blue - Secondary brand color
  TERTIARY: "#FFDE59", // Yellow - Accent color
  WHITE: "#FFFFFF", // White - Background/text color

  // Primary Color Variations (Light Blue)
  PRIMARY_LIGHT: "#ccfbfd", // primary-100
  PRIMARY_DARK: "#1e525b", // primary-900

  // Secondary Color Variations (Dark Blue)
  SECONDARY_LIGHT: "#93c5fd", // secondary-300
  SECONDARY_DARK: "#172554", // secondary-950

  // Tertiary Color Variations (Yellow)
  TERTIARY_LIGHT: "#fef08a", // tertiary-200
  TERTIARY_DARK: "#713f12", // tertiary-900

  // Neutral Colors
  GRAY_50: "#f9fafb",
  GRAY_100: "#f3f4f6",
  GRAY_200: "#e5e7eb",
  GRAY_300: "#d1d5db",
  GRAY_400: "#9ca3af",
  GRAY_500: "#6b7280",
  GRAY_600: "#4b5563",
  GRAY_700: "#374151",
  GRAY_800: "#1f2937",
  GRAY_900: "#111827",

  // Status Colors
  SUCCESS: "#22c55e",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#0ea5e9",
} as const;

/**
 * Tailwind CSS class names for brand colors
 * Use these in your className props for consistent styling
 */
export const BrandColorClasses = {
  // Background Classes
  BG_PRIMARY: "bg-primary-300",
  BG_SECONDARY: "bg-secondary-900",
  BG_TERTIARY: "bg-tertiary-300",
  BG_WHITE: "bg-white",

  // Text Classes
  TEXT_PRIMARY: "text-primary-700",
  TEXT_SECONDARY: "text-secondary-900",
  TEXT_TERTIARY: "text-tertiary-700",
  TEXT_WHITE: "text-white",

  // Border Classes
  BORDER_PRIMARY: "border-primary-300",
  BORDER_SECONDARY: "border-secondary-900",
  BORDER_TERTIARY: "border-tertiary-300",
  BORDER_GRAY: "border-gray-300",
} as const;

/**
 * Gradient combinations using brand colors
 * Perfect for buttons, headers, and accent elements
 */
export const BrandGradients = {
  PRIMARY_TO_SECONDARY: "from-primary-300 to-secondary-900",
  SECONDARY_TO_PRIMARY: "from-secondary-900 to-primary-300",
  PRIMARY_TO_TERTIARY: "from-primary-300 to-tertiary-300",
  TERTIARY_TO_PRIMARY: "from-tertiary-300 to-primary-300",
} as const;

/**
 * Color combinations for common UI patterns
 */
export const ColorCombinations = {
  // Button variants
  PRIMARY_BUTTON: {
    background: "bg-primary-300",
    text: "text-white",
    border: "border-primary-400",
    hover: "hover:bg-primary-400",
  },
  SECONDARY_BUTTON: {
    background: "bg-secondary-900",
    text: "text-white",
    border: "border-secondary-800",
    hover: "hover:bg-secondary-800",
  },
  TERTIARY_BUTTON: {
    background: "bg-tertiary-300",
    text: "text-tertiary-900",
    border: "border-tertiary-400",
    hover: "hover:bg-tertiary-400",
  },
  // Card variants
  PRIMARY_CARD: {
    background: "bg-white",
    border: "border-primary-200",
    shadow: "shadow-primary-100",
  },
  SECONDARY_CARD: {
    background: "bg-white",
    border: "border-secondary-200",
    shadow: "shadow-secondary-100",
  },
} as const;
