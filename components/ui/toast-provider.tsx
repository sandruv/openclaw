"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast, { ToastProps } from './toast'

type ToastContextType = {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([])
  const MAX_TOASTS = 5 // Maximum number of toasts to show at once

  const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
    setToasts((currentToasts) => {
      // If we have too many toasts, remove the oldest ones
      const newToasts = currentToasts.length >= MAX_TOASTS 
        ? currentToasts.slice(currentToasts.length - MAX_TOASTS + 1) 
        : currentToasts
        
      return [
        ...newToasts,
        { ...props, id: Date.now(), onClose: () => {} }
      ]
    })
  }, [])

  const closeToast = useCallback((id: number) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-3 z-[100] max-h-[80vh] overflow-hidden pointer-events-none">
        <div className="w-full max-w-md flex flex-col-reverse gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast {...toast} onClose={() => closeToast(toast.id)} />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}