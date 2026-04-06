'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SlidersHorizontal } from 'lucide-react'
import { ColorIconFilters } from './ColorIconFilters'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { TaskStatusTypeProvider, TaskStatusRecord } from '@/lib/taskStatusIdProvider'
import { STATUS_COLORS, TICKET_TYPE_COLORS, PRIORITY_COLORS, IMPACT_COLORS } from '@/constants/colors'
import { cn } from '@/lib/utils'

interface TaskListFiltersProps {
  filters: {
    status: string[]
    type: string[]
    priority: string[]
    impact: string[]
    [key: string]: any
  }
  onFilterChange: (filterKey: string, value: string) => void
  groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type'
  onGroupByChange: (groupBy: 'none' | 'status' | 'assignee' | 'client' | 'priority' | 'impact' | 'type') => void
  compactMode?: boolean
}

export function TaskListFilters({ filters, onFilterChange, groupBy, onGroupByChange, compactMode = false }: TaskListFiltersProps) {
  const [allStatuses, setAllStatuses] = useState<TaskStatusRecord[]>([])
  
  const { 
    statuses, 
    ticketTypes, 
    priorities, 
    impacts,
    fetchStatuses,
    fetchTicketTypes,
    fetchPriorities,
    fetchImpacts
  } = useDropdownStore()

  useEffect(() => {
    fetchStatuses()
    fetchTicketTypes()
    fetchPriorities()
    fetchImpacts()
  }, [fetchStatuses, fetchTicketTypes, fetchPriorities, fetchImpacts])

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statusesResult = await TaskStatusTypeProvider.getAllStatuses()
        setAllStatuses(statusesResult)
      } catch (error) {
        console.error("Error loading statuses:", error)
        setAllStatuses([])
      }
    }
    loadStatuses()
  }, [])

  const statusOptions = useMemo(() => {
    const getStatusColor = (statusName: string): string => {
      const normalizedKey = statusName.toLowerCase()
      const colorKey = Object.keys(STATUS_COLORS).find(key => key === normalizedKey)
      return colorKey ? STATUS_COLORS[colorKey as keyof typeof STATUS_COLORS] : 'bg-gray-500'
    }
    
    return allStatuses.map(status => ({
      value: status.id.toString(),
      label: status.name,
      color: getStatusColor(status.name),
      type: 'status' as const
    }))
  }, [allStatuses])

  const typeOptions = useMemo(() => {
    return ticketTypes.map(type => {
      const key = type.label.toLowerCase()
      const colorKey = Object.keys(TICKET_TYPE_COLORS).find(k => k === key)
      const color = colorKey ? TICKET_TYPE_COLORS[colorKey as keyof typeof TICKET_TYPE_COLORS] : 'bg-gray-500'
      
      return {
        value: type.value,
        label: type.label,
        color,
        type: 'ticket_type' as const
      }
    })
  }, [ticketTypes])

  const priorityOptions = useMemo(() => {
    return priorities.map(priority => {
      const key = priority.label.toLowerCase()
      const colorKey = Object.keys(PRIORITY_COLORS).find(k => k === key)
      const color = colorKey ? PRIORITY_COLORS[colorKey as keyof typeof PRIORITY_COLORS] : 'bg-gray-500'
      
      return {
        value: priority.value,
        label: priority.label,
        color,
        type: 'priority' as const
      }
    })
  }, [priorities])

  const impactOptions = useMemo(() => {
    return impacts.map(impact => {
      const key = impact.label.toLowerCase()
      const colorKey = Object.keys(IMPACT_COLORS).find(k => k === key)
      const color = colorKey ? IMPACT_COLORS[colorKey as keyof typeof IMPACT_COLORS] : 'bg-gray-500'
      
      return {
        value: impact.value,
        label: impact.label,
        color,
        type: 'impact' as const
      }
    })
  }, [impacts])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4" />
          {!compactMode && <span className="ml-2">Filters</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <div className="p-3">
          <p className="mb-0 font-medium text-sm">Filters</p>
          <div className="flex flex-col gap-2">
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

          <div className="mt-4">
            <p className="mb-2 font-medium text-sm">Group By</p>
            <div className="flex flex-col gap-1">
              {[
                { value: 'none', label: 'None' },
                { value: 'status', label: 'Status' },
                { value: 'assignee', label: 'Assignee' },
                { value: 'client', label: 'Client' },
                { value: 'priority', label: 'Priority' },
                { value: 'impact', label: 'Impact' },
                { value: 'type', label: 'Type' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={groupBy === option.value ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "justify-start h-7 text-xs",
                    groupBy === option.value && 'bg-green-500 hover:bg-green-600 text-white'
                  )}
                  onClick={() => onGroupByChange(option.value as typeof groupBy)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
