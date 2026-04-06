import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore'
import { useMemo } from 'react'

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Custom hook to get theme color variants based on user's selected theme
 */
export function useThemeColor() {
  const { settings } = useDashboardSettingsStore()
  
  return useMemo(() => {
    const baseColor = settings.themeColor
    const rgb = hexToRgb(baseColor)
    
    if (!rgb) {
      // Fallback to blue if color parsing fails
      return {
        base: '#3b82f6',
        light: '#dbeafe',
        lighter: '#eff6ff',
        dark: '#1e40af',
        darker: '#1e3a8a',
        text: '#2563eb',
        textDark: '#60a5fa',
        hover: '#2563eb',
        hoverLight: '#bfdbfe',
        bg: `rgb(59, 130, 246)`,
        bgLight: `rgba(59, 130, 246, 0.1)`,
        bgLighter: `rgba(59, 130, 246, 0.05)`,
        bgDark: `rgba(59, 130, 246, 0.3)`,
        bgDarkHover: `rgba(59, 130, 246, 0.5)`,
      }
    }
    
    return {
      base: baseColor,
      light: `rgb(${Math.min(rgb.r + 80, 255)}, ${Math.min(rgb.g + 80, 255)}, ${Math.min(rgb.b + 80, 255)})`,
      lighter: `rgb(${Math.min(rgb.r + 120, 255)}, ${Math.min(rgb.g + 120, 255)}, ${Math.min(rgb.b + 120, 255)})`,
      dark: `rgb(${Math.max(rgb.r - 50, 0)}, ${Math.max(rgb.g - 50, 0)}, ${Math.max(rgb.b - 50, 0)})`,
      darker: `rgb(${Math.max(rgb.r - 80, 0)}, ${Math.max(rgb.g - 80, 0)}, ${Math.max(rgb.b - 80, 0)})`,
      text: baseColor,
      textDark: `rgb(${Math.min(rgb.r + 60, 255)}, ${Math.min(rgb.g + 60, 255)}, ${Math.min(rgb.b + 60, 255)})`,
      hover: `rgb(${Math.max(rgb.r - 30, 0)}, ${Math.max(rgb.g - 30, 0)}, ${Math.max(rgb.b - 30, 0)})`,
      hoverLight: `rgb(${Math.min(rgb.r + 100, 255)}, ${Math.min(rgb.g + 100, 255)}, ${Math.min(rgb.b + 100, 255)})`,
      bg: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      bgLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
      bgLighter: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
      bgDark: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
      bgDarkHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
    }
  }, [settings.themeColor])
}
