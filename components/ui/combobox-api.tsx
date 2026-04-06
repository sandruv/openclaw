'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IndeterminateProgress } from '@/components/custom/IndeterminateProgress'

export type ComboboxOption = {
  value: string
  label: string
}

interface ComboboxApiProps {
  options: ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  value: string
  onValueChange: (value: string) => void
  className?: string
  disabled?: boolean
  /**
   * Required API search function
   * Called when the search input changes
   */
  onSearch: (query: string) => Promise<void>
  /**
   * Delay in milliseconds before triggering onSearch after typing
   */
  searchDebounce?: number
  /**
   * Whether the component is in a loading state (e.g., during API search)
   */
  isSearchLoading?: boolean
  /**
   * Whether to include an "Unselect" option
   */
  includeUnselect?: boolean
}

export function ComboboxApi({
  options,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  value,
  onValueChange,
  className,
  disabled = false,
  onSearch,
  searchDebounce = 500,
  isSearchLoading = false,
  includeUnselect = false,
}: ComboboxApiProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Click outside handler to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle search input changes with debounce for API search
  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await onSearch(value)
    }, searchDebounce)
  }, [onSearch, searchDebounce])

  // Clean up the timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const displayValue = React.useMemo(() => {
    if (!value) return placeholder
    return options.find((option) => option.value === value)?.label || placeholder
  }, [value, options, placeholder])

  const handleSelectOption = (optionValue: string) => {
    onValueChange(optionValue)
    setSearchQuery('')
    setOpen(false)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Button
        type="button"
        disabled={disabled}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between", className)}
        onClick={() => setOpen(!open)}
      >
        {displayValue}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md border border-border shadow-md">
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
            {isSearchLoading && (
              <div className="px-2 py-3 text-center text-sm">
                <IndeterminateProgress 
                  className="rounded-full bg-slate-100"
                  barClassName="bg-primary rounded-full"
                />
                <div className="mt-2">Loading results...</div>
              </div>
            )}
            
            {!isSearchLoading && options.length === 0 && (
              <div className="py-6 px-2 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            
            {!isSearchLoading && options.length > 0 && (
              <div className="py-1">
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent text-accent-foreground"
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
        </div>
      )}
    </div>
  )
}
