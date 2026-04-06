'use client'

import * as React from 'react'
import { Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export type SubMenuSelectOption = {
  value: string
  label: string
}

interface SubMenuSelectProps {
  options: SubMenuSelectOption[]
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
  /**
   * Label shown in the trigger
   */
  triggerLabel?: string
}

export function SubMenuSelect({
  options,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  value,
  onValueChange,
  className,
  disabled = false,
  includeUnselect = false,
  triggerLabel,
}: SubMenuSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

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

  // Handle search input changes
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const handleSelectOption = (optionValue: string) => {
    onValueChange(optionValue)
    setSearchQuery('')
  }

  // Get display value for trigger
  const displayValue = React.useMemo(() => {
    if (!value) return placeholder
    return options.find((option) => option.value === value)?.label || placeholder
  }, [value, options, placeholder])

  // Focus input when submenu opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Small delay to ensure the submenu is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    } else {
      setSearchQuery('')
    }
  }

  return (
    <DropdownMenuSub onOpenChange={handleOpenChange}>
      <DropdownMenuSubTrigger
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="flex flex-col items-start gap-0.5">
          {triggerLabel && (
            <span className="text-xs text-muted-foreground">{triggerLabel}</span>
          )}
          <span className={cn(!value && "text-muted-foreground")}>
            {displayValue}
          </span>
        </div>
      </DropdownMenuSubTrigger>
      
      <DropdownMenuPortal>
        <DropdownMenuSubContent 
          className="w-56 p-0"
          sideOffset={8}
        >
          {/* Search input */}
          <div className="flex items-center border-b p-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={`Search...`}
              className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-2"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                // Prevent closing dropdown on typing
                e.stopPropagation()
              }}
            />
          </div>
          
          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto p-1 styled-scrollbar">
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
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
