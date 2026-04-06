'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function useThemeEffect() {
  const { 
    darkMode, 
    compactMode, 
    animationMode, 
    highContrastMode 
  } = useSettingsStore()

  useEffect(() => {
    // Apply or remove the dark class based on the darkMode setting
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Apply or remove the compact mode class
    if (compactMode) {
      document.documentElement.classList.add('compact')
    } else {
      document.documentElement.classList.remove('compact')
    }

    // Apply or remove the animations class
    if (!animationMode) {
      document.documentElement.classList.add('no-animations')
    } else {
      document.documentElement.classList.remove('no-animations')
    }

    // Apply or remove the high contrast class
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [darkMode, compactMode, animationMode, highContrastMode])
}
