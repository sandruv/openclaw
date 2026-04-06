import React from 'react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Check } from 'lucide-react'

export interface ColorOption {
  value: string
  label: string
  color: string
}

interface ColorFiltersProps {
  label: string
  options: ColorOption[]
  selectedValues: string[]
  onValueChange: (value: string) => void
}

export function ColorFilters({
  label,
  options,
  selectedValues,
  onValueChange
}: ColorFiltersProps) {
  const hasSelections = selectedValues.length > 0
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">{label}:</span>
      <TooltipProvider>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onValueChange('all')}
                className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center relative",
                  !hasSelections ? "border-gray-800 border-2 bg-gray-100" : "opacity-60 hover:opacity-100 border-gray-300"
                )}
              >
                {!hasSelections && <Check className="h-3 w-3 text-gray-800" />}
                <span className="sr-only">All</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>All {label}s</p>
            </TooltipContent>
          </Tooltip>

          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value)
            
            return (
              <Tooltip key={option.value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onValueChange(option.value)}
                    className={cn(
                      "h-5 w-5 rounded flex items-center justify-center relative",
                      option.color,
                      isSelected 
                        ? "border-gray-800 border-2 shadow-md" 
                        : "opacity-60 hover:opacity-100 border border-gray-300"
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-white drop-shadow-sm" />
                    )}
                    <span className="sr-only">{option.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className={cn(option.color, "text-white font-medium border-0")}>
                  <p>{option.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>
      
      {hasSelections && (
        <span className="text-xs text-muted-foreground ml-1">
          ({selectedValues.length} selected)
        </span>
      )}
    </div>
  )
}
