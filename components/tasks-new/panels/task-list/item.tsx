'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Task } from '@/types/tasks'
import { formatDistanceShort } from '@/lib/dateTimeFormat'
import { 
  getTicketTypeIcon, 
  getTicketTypeColor, 
  getPriorityColor, 
  getImpactColor, 
  getStatusColor, 
  getPriorityIcon, 
  getImpactIcon,
  TicketType, 
  PriorityType, 
  ImpactType, 
  StatusType 
} from '@/lib/taskUtils'
import { ClientSection } from '@/components/tasks/kanban-view/subcomponents/KanbanCard/sections/ClientSection'
import { AgentSection } from '@/components/tasks/kanban-view/subcomponents/KanbanCard/sections/AgentSection'
import { IconSection } from '@/components/tasks/kanban-view/subcomponents/KanbanCard/sections/IconSection'

interface TaskListItemProps {
  task: Task
  isSelected: boolean
  compactMode?: boolean
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDistanceShort(date)
}

export function TaskListItem({ task, isSelected, compactMode = false }: TaskListItemProps) {
  const statusKey = task.status.name.toLowerCase() as StatusType
  const priorityKey = task.priority.name.toLowerCase() as PriorityType
  const impactKey = task.impact.name.toLowerCase() as ImpactType
  const typeKey = task.ticket_type.name.toLowerCase() as TicketType
  
  const priorityColor = getPriorityColor(priorityKey)
  const impactColor = getImpactColor(impactKey)
  const typeColor = getTicketTypeColor(typeKey)
  const priorityIcon = getPriorityIcon(priorityKey)
  const impactIcon = getImpactIcon(impactKey)
  const typeIcon = getTicketTypeIcon(typeKey)
  const statusBorderColor = getStatusColor(statusKey, 'border-l-4 border-l-')
  const createdAt = formatDate(task.created_at)
  const updatedAt = formatDate(task.updated_at)

  const cardStyle = cn(
    "p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200",
    "border-b border-gray-100 dark:border-gray-700 flex flex-col gap-2 relative overflow-hidden cursor-pointer",
    "hover:bg-muted/50 transition-all duration-200",
    statusBorderColor,
    isSelected && "bg-accent"
  )

  return (
    <Link href={`/tasks-new/${task.id}`} className="block">
      <div className={cardStyle}>
        {/* Top Section - ID & Type */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
            <span>#{task.id}</span>
            
            <IconSection 
              icon={typeIcon}
              color={typeColor}
              tooltip={task.ticket_type.name}
            />

            <span className="dark:text-gray-400">{createdAt}</span>

            <IconSection 
              icon={priorityIcon}
              color={priorityColor}
              tooltip={task.priority.name}
            />

            <IconSection 
              icon={impactIcon}
              color={impactColor}
              tooltip={task.impact.name}
            />
          </div>

          <div className="flex items-center gap-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400 w-full">
              {task.client && (
                <ClientSection client={task.client} />
              )}
            
              <div className="flex items-center gap-2">
                <AgentSection agent={task.agent} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary */}
        <h4 className="font-medium text-sm line-clamp-2 dark:text-white">{task.summary}</h4>
        
      </div>
    </Link>
  )
}
