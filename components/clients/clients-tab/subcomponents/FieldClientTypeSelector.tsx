'use client'

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ClientType = 'Client' | 'Archived Client' | 'Vendor' | 'Prospect' | 'Competitor'

interface ClientTypeSelectorProps {
  selectedType: ClientType
  onTypeChange: (type: ClientType) => void
  disabled?: boolean
  className?: string
}

export function ClientTypeSelector({ selectedType, onTypeChange, disabled, className }: ClientTypeSelectorProps) {
  const types: ClientType[] = ['Client', 'Archived Client', 'Vendor', 'Prospect', 'Competitor']

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
            selectedType === type ? "bg-green-500 hover:bg-green-600 text-white" : "",
            className
          )}
        >
          {type}
        </Button>
      ))}
    </div>
  )
}
