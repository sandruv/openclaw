import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export type ToastProps = {
  title: string
  description: string
  type: 'error' | 'info' | 'warning' | 'success'
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ title, description, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration - 300) // Start hiding 300ms before actually closing

    const closeTimer = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(closeTimer)
    }
  }, [duration, onClose])

  const bgColor = {
    error: 'bg-red-700',
    info: 'bg-blue-600',
    warning: 'bg-amber-500',
    success: 'bg-green-600'
  }[type]

  return (
    <div
      className={`p-4 rounded-md text-white ${bgColor} shadow-lg w-full max-w-md transition-all duration-300 ease-in-out transform ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm">{description}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="ml-4 focus:outline-none" aria-label="Close">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export default Toast