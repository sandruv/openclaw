'use client'

import React, { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  onRemove?: (index: number) => void
  placeholder?: string
  prefix?: string
  className?: string
  validate?: (value: string) => boolean
  transform?: (value: string) => string
  maxTags?: number
  onMaxTags?: () => void
  disabled?: boolean
}

export function TagInput({ 
  value, 
  onChange,
  onRemove,
  placeholder = "Add tag",
  prefix,
  className,
  validate = () => true,
  transform = (v) => v,
  maxTags,
  onMaxTags,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const addTag = (tag: string) => {
    const transformedTag = transform(tag.trim())
    if (
      transformedTag && 
      !value.includes(transformedTag) && 
      validate(transformedTag) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, transformedTag])
      setInputValue("")
    } else if (maxTags && value.length >= maxTags) {
      onMaxTags?.()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      onChange(value.slice(0, -1))
    } else if ([' ', ',', 'Tab', 'Enter'].includes(e.key)) {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  const handleRemove = (index: number) => {
    const newTags = value.filter((_, i) => i !== index)
    onChange(newTags)
    onRemove?.(index)
  }

  useEffect(() => {
    const adjustInputWidth = () => {
      if (inputRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const tagBadgesWidth = Array.from(containerRef.current.children)
          .slice(0, -1) // Exclude the input element
          .reduce((total, element) => total + element.clientWidth + 8, 0)
        const minWidth = 50 // Minimum width for input
        const newWidth = Math.max(minWidth, containerWidth - tagBadgesWidth - 40)
        inputRef.current.style.width = `${newWidth}px`
      }
    }

    adjustInputWidth()
    window.addEventListener('resize', adjustInputWidth)
    return () => window.removeEventListener('resize', adjustInputWidth)
  }, [value])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-wrap items-center gap-2 min-h-[40px] px-3 py-2 rounded-md border border-input bg-background",
        "focus-within:ring-1 focus-within:ring-emerald-400 focus-within:border-emerald-400",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {prefix && (
        <span className="text-sm text-muted-foreground mr-1">{prefix}</span>
      )}
      {value.map((tag, index) => (
        <Badge 
          key={index}
          variant="secondary"
          className={cn(
            "text-sm py-1 px-2 gap-1",
            !disabled && "hover:bg-secondary/80"
          )}
        >
          {tag}
          {!disabled && (
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => handleRemove(index)}
            />
          )}
        </Badge>
      ))}
      {(!maxTags || value.length < maxTags) && !disabled && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          className="flex-1 min-w-[50px] bg-transparent border-none outline-none text-sm p-0 placeholder:text-sm placeholder:text-muted-foreground"
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled}
        />
      )}
    </div>
  )
}
