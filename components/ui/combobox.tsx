'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  value: string
  onValueChange: (value: string) => void
  className?: string
  disabled?: boolean
  /**
   * Whether to include an "Unselect" option
   */
  includeUnselect?: boolean
}

export function Combobox({
  options,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  value,
  onValueChange,
  className,
  disabled = false,
  includeUnselect = true,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})

  // Calculate dropdown position based on trigger element
  const getDropdownPosition = React.useCallback((): React.CSSProperties => {
    if (!triggerRef.current) return {}
    
    const rect = triggerRef.current.getBoundingClientRect()
    const dropdownHeight = 250 // Approximate max height (search input + max-h-[200px] + padding)
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    
    // If not enough space below and more space above, flip to top
    const shouldFlipToTop = spaceBelow < dropdownHeight && spaceAbove > spaceBelow
    
    return {
      position: 'fixed',
      top: shouldFlipToTop ? undefined : rect.bottom + 4,
      bottom: shouldFlipToTop ? viewportHeight - rect.top + 4 : undefined,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    }
  }, [])

  const updateDropdownPosition = React.useCallback(() => {
    setDropdownStyle(getDropdownPosition())
  }, [getDropdownPosition])

  // Update position when dropdown opens and on scroll/resize
  // Using useLayoutEffect to calculate position synchronously before paint (prevents flicker)
  React.useLayoutEffect(() => {
    if (!open) return
    
    updateDropdownPosition()
    
    const handleScrollOrResize = () => {
      updateDropdownPosition()
    }
    
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [open, updateDropdownPosition])

  // Click outside handler to close dropdown
  React.useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedTrigger = triggerRef.current?.contains(target)
      const clickedDropdown = dropdownRef.current?.contains(target)
      
      if (!clickedTrigger && !clickedDropdown) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Prepare options with optional unselect option
  const allOptions = React.useMemo(() => {
    if (includeUnselect) {
      return [{ value: '', label: 'Unselect' }, ...options]
    }
    return [...options]
  }, [options, includeUnselect])

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return allOptions

    const lowercasedQuery = searchQuery.toLowerCase()
    return allOptions.filter((option) =>
      option.label.toLowerCase().includes(lowercasedQuery)
    )
  }, [allOptions, searchQuery])

  // Handle search input changes for local filtering
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSelectOption = (optionValue: string) => {
    onValueChange(optionValue)
    setSearchQuery('')
    setOpen(false)
  }

  const displayValue = React.useMemo(() => {
    if (!value) return placeholder
    return options.find((option) => option.value === value)?.label || placeholder
  }, [value, options, placeholder])

  // Dropdown content to render in portal
  const dropdownContent = open && typeof document !== 'undefined' ? createPortal(
    <div 
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-popover rounded-md border border-border shadow-md animate-in fade-in-0 zoom-in-95"
    >
      <div className="flex items-center border-b p-2">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          type="text"
          placeholder={`Search ${placeholder.toLowerCase()}...`}
          className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-2"
          value={searchQuery}
          onChange={handleSearchChange}
          autoFocus
        />
      </div>
      
      <div className="w-full max-h-[200px] overflow-y-auto p-1 styled-scrollbar">
        {filteredOptions.length === 0 && (
          <div className="py-6 px-2 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
        
        {filteredOptions.length > 0 && (
          <div className="py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  value === option.value && "bg-accent text-accent-foreground",
                  option.value === '' && "text-muted-foreground italic"
                )}
                onClick={() => handleSelectOption(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        onClick={() => {
          if (!open) {
            // Calculate position synchronously before opening to prevent flicker
            setDropdownStyle(getDropdownPosition())
          }
          setOpen(!open)
        }}
      >
        {displayValue}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {dropdownContent}
    </div>
  )
}