'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComboboxApi } from '@/components/ui/combobox-api'
import { Combobox } from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { ComboboxOption } from '@/components/ui/combobox'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/useSettingsStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface UserFiltersProps {
  clients: ComboboxOption[]
  roles: ComboboxOption[]
  selectedClientId: string
  selectedRoleId: string
  onClientChange: (value: string) => void
  onRoleChange: (value: string) => void
  onClearFilters: () => void
  className?: string
}

export interface FilterButtonProps {
  hasFilters: boolean
  filterCount: number
  isActive: boolean
  onClick: () => void
  className?: string
}

export function FilterButton({
  hasFilters,
  filterCount,
  isActive,
  onClick,
  className
}: FilterButtonProps) {
  const { compactMode } = useSettingsStore()
  
  const button = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className={cn(isActive ? "bg-gray-100" : undefined, `flex items-center ${compactMode ? 'px-2' : 'gap-1'}`, className)}
    >
      <Filter className={`h-4 w-4 ${!compactMode ? 'mr-1' : ''}`} />
      {!compactMode && (
        <>
          Filters {hasFilters && 
            <Badge variant="secondary" className="ml-2 px-1 py-0">
              {filterCount}
            </Badge>
          }
        </>
      )}
    </Button>
  )

  if (compactMode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Filters{hasFilters ? ` (${filterCount})` : ''}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  const { compactMode } = useSettingsStore()
  
  const button = (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`text-red-500 hover:text-red-600 border-red-500 hover:border-red-600 flex items-center ${compactMode ? 'px-2' : 'gap-1'}`}
    >
      <X className={`h-3.5 w-3.5 ${!compactMode ? 'mr-1' : ''}`} />
      {!compactMode && <span>Clear</span>}
    </Button>
  )

  if (compactMode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear Filters</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

export interface FilterContentProps {
  clients: ComboboxOption[]
  roles: ComboboxOption[]
  selectedClientId: string
  selectedRoleId: string
  onClientChange: (value: string) => void
  onRoleChange: (value: string) => void
  className?: string
  collapsible?: boolean
  onSearchClients?: (query: string) => Promise<void>
  isSearchingClients?: boolean
}

export function FilterContent({
  clients,
  roles,
  selectedClientId,
  selectedRoleId,
  onClientChange,
  onRoleChange,
  className,
  collapsible = false,
  onSearchClients,
  isSearchingClients = false
}: FilterContentProps) {
  const wrapperClassName = collapsible 
    ? cn("p-4 bg-gray-50 rounded-md border", className)
    : className;

  return (
    <div className={cn("flex flex-wrap gap-4", wrapperClassName)}>
      <div className="w-72 sm:w-56">
        {onSearchClients ? (
          <ComboboxApi
            options={clients}
            value={selectedClientId}
            onValueChange={onClientChange}
            onSearch={onSearchClients}
            isSearchLoading={isSearchingClients}
            searchDebounce={500}
            placeholder="Select company"
            emptyMessage="No companies found"
            includeUnselect={true}
            className="w-full"
          />
        ) : (
          <Combobox
            options={clients}
            value={selectedClientId}
            onValueChange={onClientChange}
            placeholder="Select company..."
            emptyMessage="No companies found"
            includeUnselect={true}
            className="w-full"
          />
        )}
      </div>
      
      <div className="w-72 sm:w-56">
        <Combobox
          options={roles}
          value={selectedRoleId}
          onValueChange={onRoleChange}
          placeholder="Select role..."
          emptyMessage="No roles found"
          includeUnselect={true}
          className="w-full"
        />
      </div>
    </div>
  )
}
