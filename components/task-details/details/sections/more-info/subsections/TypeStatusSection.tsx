'use client'

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getTicketTypeColor, getStatusColor, TicketType, StatusType } from "@/lib/taskUtils"
import { Task } from "@/types/tasks"
import { SkeletonBadge } from "@/components/ui/skeleton-inline"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComboboxOption } from "@/components/ui/combobox"

interface TypeStatusSectionProps {
  task: Task
  editMode: boolean
  isNavigating: boolean
  isSubmitting: boolean
  ticketTypes: ComboboxOption[]
  selectedTypeId: string
  setSelectedTypeId: (id: string) => void
}

export function TypeStatusSection({
  task,
  editMode,
  isNavigating,
  isSubmitting,
  ticketTypes,
  selectedTypeId,
  setSelectedTypeId
}: TypeStatusSectionProps) {
  return (
    <>
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Task Type</div>
        {editMode ? (
          <Select
            value={selectedTypeId}
            onValueChange={setSelectedTypeId}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select task type" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              {ticketTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-xs">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <SkeletonBadge isLoading={isNavigating}>
            <Badge className={cn(
              getTicketTypeColor((task.ticket_type?.name ?? 'none').toLowerCase() as TicketType),
              (task.ticket_type?.name ?? 'none').toLowerCase() === 'closed' && 'bg-black/80',
              "dark:text-white"
            )}>
              {task.ticket_type?.name ?? 'Unknown'}
            </Badge>
          </SkeletonBadge>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Status</div>
        <SkeletonBadge isLoading={isNavigating}>
          <Badge className={cn(
            getStatusColor((task.status?.name ?? 'unknown').toLowerCase() as StatusType),
            "border",
            (task.status?.name ?? '').toLowerCase() === 'closed' && 'bg-gray-500 text-white border-gray-600',
            (task.status?.name ?? '').toLowerCase() === 'archived' && 'bg-gray-200 text-black border-gray-600',
            !['closed', 'archived'].includes((task.status?.name ?? '').toLowerCase()) && 'text-white',
          )}>
            {task.status?.name ?? 'Unknown'}
          </Badge>
        </SkeletonBadge>
      </div>
    </>
  )
}
