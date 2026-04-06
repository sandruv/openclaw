'use client'

import { Badge } from "@/components/ui/badge"
import { getPriorityColor, getImpactColor, PriorityType, ImpactType } from "@/lib/taskUtils"
import { Task } from "@/types/tasks"
import { SkeletonBadge } from "@/components/ui/skeleton-inline"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComboboxOption } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

interface PriorityImpactSectionProps {
  task: Task
  editMode: boolean
  isNavigating: boolean
  isSubmitting: boolean
  priorities: ComboboxOption[]
  impacts: ComboboxOption[]
  selectedPriorityId: string
  selectedImpactId: string
  setSelectedPriorityId: (id: string) => void
  setSelectedImpactId: (id: string) => void
}

export function PriorityImpactSection({
  task,
  editMode,
  isNavigating,
  isSubmitting,
  priorities,
  impacts,
  selectedPriorityId,
  selectedImpactId,
  setSelectedPriorityId,
  setSelectedImpactId
}: PriorityImpactSectionProps) {
  return (
    <>
      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Priority</div>
        {editMode ? (
          <Select
            value={selectedPriorityId}
            onValueChange={setSelectedPriorityId}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select priority" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value} className="text-xs">
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <SkeletonBadge isLoading={isNavigating}>
            <Badge className={getPriorityColor((task.priority?.name ?? 'unknown').toLowerCase() as PriorityType)}>
              {task.priority?.name ?? 'Unknown'}
            </Badge>
          </SkeletonBadge>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-muted-foreground text-xs">Impact</div>
        {editMode ? (
          <Select
            value={selectedImpactId}
            onValueChange={setSelectedImpactId}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Select impact" className="font-bold" />
            </SelectTrigger>
            <SelectContent>
              {impacts.map((impact) => (
                <SelectItem key={impact.value} value={impact.value} className="text-xs">
                  {impact.label || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <SkeletonBadge isLoading={isNavigating}>
            <Badge className={cn(getImpactColor((task.impact?.name ?? 'unknown').toLowerCase() as ImpactType), "dark:text-white")}>
              {task.impact?.name ?? 'Unknown'}
            </Badge>
          </SkeletonBadge>
        )}
      </div>
    </>
  )
}
