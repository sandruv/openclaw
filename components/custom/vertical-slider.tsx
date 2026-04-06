'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

interface VerticalSliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  className?: string
}

export default function VerticalSlider({
  min,
  max,
  step,
  value,
  onChange,
  className = '',
}: VerticalSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging && sliderRef.current && thumbRef.current) {
      const sliderRect = sliderRef.current.getBoundingClientRect()
      const thumbHeight = thumbRef.current.offsetHeight
      const newPosition = Math.max(0, Math.min(event.clientY - sliderRect.top - thumbHeight / 2, sliderRect.height - thumbHeight))
      const percentage = 1 - newPosition / (sliderRect.height - thumbHeight)
      const newValue = Math.round((percentage * (max - min) + min) / step) * step
      onChange(newValue)
    }
  }, [isDragging, min, max, step, onChange])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={`relative h-48 w-3 ${className}`}>
      <div
        ref={sliderRef}
        className="absolute inset-0 bg-gray-200 rounded-full cursor-pointer"
        onClick={(e) => {
          if (sliderRef.current) {
            const sliderRect = sliderRef.current.getBoundingClientRect()
            const clickPosition = e.clientY - sliderRect.top
            const percentage = 1 - clickPosition / sliderRect.height
            const newValue = Math.round((percentage * (max - min) + min) / step) * step
            onChange(newValue)
          }
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-full"
          style={{ height: `${percentage}%` }}
        />
        <div
          ref={thumbRef}
          className="absolute left-[-4px] right-0 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab active:cursor-grabbing"
          style={{ bottom: `calc(${percentage}% - 12px)` }}
          onMouseDown={handleMouseDown}
        />
      </div>
      {/* <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-500">
        {value}
      </div> */}
    </div>
  )
}