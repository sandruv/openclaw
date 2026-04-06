'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ServiceType = 'MSP' | 'Web Host' | 'Phone' | 'Print' | 'Others'

interface ServiceTypeSelectorProps {
  selectedType: ServiceType
  onTypeChange: (type: ServiceType) => void
  disabled?: boolean
  className?: string
}

export function ServiceTypeSelector({ selectedType, onTypeChange, disabled, className }: ServiceTypeSelectorProps) {
  const types: ServiceType[] = ['MSP', 'Web Host', 'Phone', 'Print', 'Others']

  return (
    <div className="flex flex-wrap gap-2">
      {types.map((type) => (
        <Button
          type="button"
          key={type}
          variant={selectedType === type ? "default" : "outline"}
          onClick={() => onTypeChange(type)}
          disabled={disabled}
          className={cn(
            selectedType === type ? "bg-green-500 hover:bg-green-600" : "",
            className
          )}
        >
          {type}
        </Button>
      ))}
    </div>
  )
}
