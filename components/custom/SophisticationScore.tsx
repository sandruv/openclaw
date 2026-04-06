'use client'

import React, { useState, useEffect } from 'react'
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SophisticationScoreProps {
  onChange?: (value: number) => void
  score?: number
  disabled?: boolean
}

export function SophisticationScore({ onChange, score: initialScore, disabled = false }: SophisticationScoreProps) {
  const [score, setScore] = useState<number>(initialScore || 0)
  const [hoverScore, setHoverScore] = useState<number>(0)

  useEffect(() => {
    if (initialScore !== undefined) {
      setScore(initialScore)
    }
  }, [initialScore])

  const handleScoreChange = (newScore: number) => {
    if (!disabled) {
      setScore(newScore)
      onChange?.(newScore)
    }
  }

  const getDescription = (level: number) => {
    switch (level) {
      case 0: return "Set technical level"
      case 1: return "1 - Non-Technical"
      case 2: return "2 - Below Average"
      case 3: return "3 - Average"
      case 4: return "4 - Above Average"
      case 5: return "5 - Highly Technical"
      default: return ""
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mt-2">
        {getDescription(hoverScore || score)}
      </p>
      <div 
        id="sophistication-score" 
        className={cn(
          "flex items-end gap-1 h-10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseLeave={() => setHoverScore(0)}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            type="button"
            key={level}
            onClick={() => handleScoreChange(level)}
            onMouseEnter={() => !disabled && setHoverScore(level)}
            className={cn(
              "w-6 rounded-sm transition-all duration-200 ease-in-out",
              !disabled && "cursor-pointer",
              disabled && "cursor-not-allowed",
              level <= score ? "bg-blue-500" : "bg-muted",
              !disabled && level <= hoverScore && level > score ? "bg-primary/50" : "",
              {
                'h-4': level === 1,
                'h-5': level === 2,
                'h-6': level === 3,
                'h-7': level === 4,
                'h-8': level === 5,
              }
            )}
            aria-label={`Set technical level to ${level}`}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}