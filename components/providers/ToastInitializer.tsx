'use client'

import { useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { setToastFunction } from '@/stores/useKanbanStore'

/**
 * This component initializes the toast function in the Kanban store.
 * It allows the store to display toast notifications even though it's outside React.
 */
export const ToastInitializer: React.FC = () => {
  const { showToast } = useToast()
  
  useEffect(() => {
    // Register the toast function with the Kanban store
    setToastFunction(showToast)
    
    return () => {
      // Clean up when component unmounts
      setToastFunction(null)
    }
  }, [showToast])
  
  // This component doesn't render anything
  return null
}

export default ToastInitializer
