'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUpRight } from 'lucide-react'
import { formatDistanceShort } from '@/lib/dateTimeFormat'
import { getTicketTypeIcon, getTicketTypeColor, getPriorityColor, 
  getImpactColor, getStatusColor, getPriorityIcon, getImpactIcon, 
  TicketType, PriorityType, ImpactType, StatusType } from '@/lib/taskUtils'
import { KanbanCardProps } from '@/types/kanban'
import { ClientSection } from './sections/ClientSection'
import { AgentSection } from './sections/AgentSection'
import { IconSection } from './sections/IconSection'
import { TimeSection } from './sections/TimeSection'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'

interface ExpandedCardProps {
  task: KanbanCardProps['task'];
  onClick: (taskId: string) => void;
  isProcessing?: boolean;
  activeSeconds?: number;
}

// Utility function to format date
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return formatDistanceShort(date)
  } catch {
    return 'Unknown'
  }
}

export function ExpandedCard({ task, onClick, isProcessing = false, activeSeconds }: ExpandedCardProps) {
  const [loading, setLoading] = useState(false)
  const isTaskLoading = useKanbanStore((state) => state.isTaskLoading)
  
  // Check if this specific task is loading from the kanban store
  const isKanbanLoading = isTaskLoading(task.id.toString())
  
  const loadAndNavigate = () => {
    setLoading(true)
    onClick(task.id.toString())
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  // Safely get keys, with fallbacks
  const statusKey = task.status?.name?.toLowerCase() as StatusType || 'todo'
  const priorityKey = task.priority?.name?.toLowerCase() as PriorityType || 'normal'
  const impactKey = task.impact?.name?.toLowerCase() as ImpactType || 'medium'
  const typeKey = task.ticket_type?.name?.toLowerCase() as TicketType || 'task'
  
  const priorityColor = getPriorityColor(priorityKey)
  const impactColor = getImpactColor(impactKey)
  const typeColor = getTicketTypeColor(typeKey)
  const priorityIcon = getPriorityIcon(priorityKey)
  const impactIcon = getImpactIcon(impactKey)
  const typeIcon = getTicketTypeIcon(typeKey)
  const statusBorderColor = getStatusColor(statusKey, 'border-l-4 border-l-')
  
  // Safe date formatting
  const createdAt = task.created_at ? formatDate(task.created_at) : 'Unknown'
  const updatedAt = task.updated_at ? formatDate(task.updated_at) : 'Unknown'
  
  // Safe property access
  const taskSummary = task.summary || 'No Summary'
  const statusName = task.status?.name || 'Unknown Status'
  const priorityName = task.priority?.name || 'Unknown Priority'
  const impactName = task.impact?.name || 'Unknown Impact'
  const typeName = task.ticket_type?.name || 'Unknown Type'

  const cardStyle = cn(
    "p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200",
    "border border-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 flex flex-col gap-2 relative overflow-hidden cursor-pointer",
    "hover:translate-y-[-2px] transition-transform duration-200",
    statusBorderColor,
    isKanbanLoading && "opacity-50 pointer-events-none"
  )

  return (
    <div className={cardStyle}>
      {/* Loading overlay for individual task processing */}
      {isKanbanLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-[0.5px] z-10 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
      
      {/* Top Section - ID & Type */}
      <div className={cn('flex justify-between items-center')}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
          <span>#{task.id}</span>
          
          <IconSection 
            icon={typeIcon}
            color={typeColor}
            tooltip={typeName}
          />

          <span className="dark:text-gray-400">{createdAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <IconSection 
            icon={priorityIcon}
            color={priorityColor}
            tooltip={priorityName}
          />

          <IconSection 
            icon={impactIcon}
            color={impactColor}
            tooltip={impactName}
          />
        </div>
      </div>
      
      {/* Summary & Client */}
      <h4 className="font-medium text-sm line-clamp-2 dark:text-white">{taskSummary}</h4>
      
      {/* Bottom Section */}
      <div className="flex justify-between items-center">
        <div className="flex justify-between items-center text-xs text-muted-foreground dark:text-gray-400 w-full">
          <div className="flex items-center gap-2">
            {task.client && (
              <ClientSection client={task.client} />
            )}

            <TimeSection 
              totalTimeSeconds={task.total_time_seconds || 0} 
              status={task.status?.id as TaskStatusType || 1} 
              activeSeconds={activeSeconds}
            />
          </div>
        
          <div className="flex items-center gap-2 pr-4">
            <AgentSection agent={task.agent} />
            <span className="dark:text-gray-400">
              {updatedAt}
            </span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="default"
          className="text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 p-0 h-5 w-5"
          onClick={loadAndNavigate}
        >
          {(loading || isProcessing || isKanbanLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && !isProcessing && !isKanbanLoading && <ArrowUpRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}