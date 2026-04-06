'use client'

import { useEffect } from 'react'

// This script runs on the client side to set the initial theme based on localStorage
// before the page renders to prevent flickering
export function ThemeScript() {
  useEffect(() => {
    // This runs once when the component mounts
    const initializeTheme = () => {
      try {
        const storedSettings = localStorage.getItem('settings-storage')
        if (storedSettings) {
          const { state } = JSON.parse(storedSettings)
          
          // Apply dark mode if it's enabled in settings
          if (state.darkMode) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          
          // Apply compact mode if enabled
          if (state.compactMode) {
            document.documentElement.classList.add('compact')
          }
          
          // Apply no-animations if animations are disabled
          if (!state.animationMode) {
            document.documentElement.classList.add('no-animations')
          }
          
          // Apply high contrast if enabled
          if (state.highContrastMode) {
            document.documentElement.classList.add('high-contrast')
          }
        }
      } catch (error) {
        console.error('Failed to initialize theme from localStorage:', error)
      }
    }

    initializeTheme()
  }, [])

  return null
}
