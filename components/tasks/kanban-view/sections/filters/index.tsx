import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { STATUS_COLORS, TICKET_TYPE_COLORS, PRIORITY_COLORS, IMPACT_COLORS } from "@/constants/colors"
import { ColorIconFilters } from "@/components/tasks/list-view/sections/filters/ColorIconFilters"
import { useSettingsStore } from '@/stores/useSettingsStore';
import { cn } from "@/lib/utils";

interface KanbanFiltersProps {
  search: string
  filters: {
    tier: string
    status: string[]
    type: string[]
    priority: string[]
    client: string
    assignee: string
    impact: string[]
  }
  clients: ComboboxOption[]
  assignees: ComboboxOption[]
  onSearchChange: (value: string) => void
  onFilterChange: (filterType: string, value: string) => void
  onResetFilters: () => void
}

export function KanbanFilters({ 
  search, 
  filters, 
  clients,
  assignees,
  onSearchChange, 
  onFilterChange, 
  onResetFilters 
}: KanbanFiltersProps) {
  const { compactMode } = useSettingsStore();

  // Convert color objects to arrays for easier mapping
  const statusOptions = Object.entries(STATUS_COLORS).map(([key, color]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    color,
    type: 'status' as const
  }))

  const typeOptions = Object.entries(TICKET_TYPE_COLORS).map(([key, color]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    color,
    type: 'ticket_type' as const
  }))

  const priorityOptions = Object.entries(PRIORITY_COLORS).map(([key, color]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    color,
    type: 'priority' as const
  }))

  const impactOptions = Object.entries(IMPACT_COLORS).map(([key, color]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    color,
    type: 'impact' as const
  }))

  // No longer need this here since reset button moved to Header
  // Keeping it commented for reference
  // const hasActiveFilters = useMemo(() => {
  //   return Object.values(filters).some(value => value !== '' && value !== 'all')
  // }, [filters])

  return (
    <div className="flex flex-col space-y-2 w-full">

      <div className="flex flex-col gap-2 w-full bg-muted/30 p-3 rounded-md border">
          <div className={cn(
            "flex flex-wrap", 
            compactMode ? "gap-3" : "gap-5"
          )}>
            <Combobox
              options={clients}
              value={filters.client}
              onValueChange={(value) => onFilterChange('client', value)}
              placeholder="By Client"
              className={compactMode ? "w-[150px]" : "w-[180px]"}
              emptyMessage="No clients found"
            />

            <Combobox
              options={assignees}
              value={filters.assignee}
              onValueChange={(value) => onFilterChange('assignee', value)}
              placeholder="By Assignee"
              className={compactMode ? "w-[150px]" : "w-[180px]"}
              emptyMessage="No assignees found"
            />
            
            <ColorIconFilters
              label="Status"
              options={statusOptions}
              selectedValues={filters.status}
              onValueChange={(value) => onFilterChange('status', value)}
              type="status"
            />
            
            <ColorIconFilters
              label="Type"
              options={typeOptions}
              selectedValues={filters.type}
              onValueChange={(value) => onFilterChange('type', value)}
              type="ticket_type"
            />
            
            <ColorIconFilters
              label="Priority"
              options={priorityOptions}
              selectedValues={filters.priority}
              onValueChange={(value) => onFilterChange('priority', value)}
              type="priority"
            />
            
            <ColorIconFilters
              label="Impact"
              options={impactOptions}
              selectedValues={filters.impact}
              onValueChange={(value) => onFilterChange('impact', value)}
              type="impact"
            />
          </div>
        </div>
    </div>
  )
}
