'use client'

import React from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Task } from "@/types/tasks"
import { formatDistance } from 'date-fns'
import { 
  Clock, 
  User, 
  Tag, 
  MapPin, 
  Star, 
  Briefcase 
} from 'lucide-react'

interface MoreInfoHoverCardProps {
  task: Task
  children: React.ReactNode
}

export function MoreInfoHoverCard({ task, children }: MoreInfoHoverCardProps) {
  const renderInfoRow = (icon: React.ElementType, label: string, value: string | undefined) => {
    const Icon = icon
    return value ? (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 text-gray-500" />
        <span>{label}: {value}</span>
      </div>
    ) : null
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border"
        side="bottom"
        align="start"
        sideOffset={-150}
        collisionPadding={10}
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Task Details
          </h3>

          {renderInfoRow(Clock, 'Created', 
            task.created_at ? formatDistance(new Date(task.created_at), new Date(), { addSuffix: true }) : undefined
          )}

          {renderInfoRow(User, 'Assignee', task.agent ? `${(task.agent.first_name || '').trim()} ${(task.agent.last_name || '').trim()}`.trim() || 'Unknown' : undefined)}
          
          {renderInfoRow(Tag, 'Type', task.ticket_type?.name || undefined)}
          
          {renderInfoRow(Star, 'Priority', task.priority?.name || undefined)}
          
          {renderInfoRow(MapPin, 'Impact', task.impact?.name || undefined)}
          
          {renderInfoRow(Briefcase, 'Client', task.client?.name)}

          {task.summary && (
            <div className="text-sm text-muted-foreground max-h-24 overflow-y-auto">
              <p className="line-clamp-3">{task.summary}</p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
