import React from 'react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getTicketTypeIcon, getPriorityIcon, getImpactIcon, TicketType, PriorityType, ImpactType } from "@/lib/taskUtils"
import { LucideIcon, Check } from 'lucide-react'

export interface ColorIconOption {
  value: string
  label: string
  color: string
  type?: 'status' | 'priority' | 'impact' | 'ticket_type'
}

interface ColorIconFiltersProps {
  label: string
  options: ColorIconOption[]
  selectedValues: string[]
  onValueChange: (value: string) => void
  type: 'status' | 'priority' | 'impact' | 'ticket_type'
}

export function ColorIconFilters({
  label,
  options,
  selectedValues,
  onValueChange,
  type
}: ColorIconFiltersProps) {
  const hasSelections = selectedValues.length > 0
  // Function to get the appropriate icon component based on type and value
  const getIconComponent = (type: string, value: string): LucideIcon | null => {
    const new_value = value.toLowerCase()
    switch (type) {
      case 'priority':
        return getPriorityIcon(new_value as PriorityType)
      case 'impact':
        return getImpactIcon(new_value as ImpactType)
      case 'ticket_type':
        return getTicketTypeIcon(new_value as TicketType)
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col  gap-2">
      <span className="text-xs text-muted-foreground font-medium">{label}:</span>
      <TooltipProvider>
        <div className="flex gap-1 flex-wrap">
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
            const IconComponent = type !== 'status' ? getIconComponent(type, option.label) : null;
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
                    data-value={option.value}
                  >
                    {IconComponent && !isSelected && <IconComponent className="h-3 w-3 text-white" />}
                    {isSelected && <Check className="h-3 w-3 text-white drop-shadow-sm" />}
                    {!IconComponent && !isSelected && <span className="sr-only">{option.label}</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent className={cn(option.color, "text-white font-medium border-0")}>
                  <p>{option.label}</p>
                </TooltipContent>
              </Tooltip>
            );
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
