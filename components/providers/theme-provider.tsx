'use client'

import { useThemeEffect } from '@/hooks/useThemeEffect'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use the theme effect hook to apply theme classes
  useThemeEffect()

  return <>{children}</>
}
