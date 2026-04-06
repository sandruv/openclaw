'use client'

import { cn, getInitials } from '@/lib/utils'
import { formatDistanceShort } from '@/lib/dateTimeFormat'
import { ClockArrowUp } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { VipIndicator } from '@/components/custom/vip-indicator'
import { UserAvatar2 } from '@/components/global/UserAvatar2'

// Utility function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDistanceShort(date)
}

interface TaskCardProps {
  task: {
    id: number
    summary: string | null
    client: {
      id: number
      name: string
      is_client_vip?: boolean
      avatar_url?: string | null
    }
    status: {
      id: number
      name: string
    }
    ticket_type: {
      id: number
      name: string
    }
    priority: {
      id: number
      name: string
    }
    impact: {
      id: number
      name: string
    }
    user: {
      id: number
      first_name: string
      last_name: string
      email: string
    }
    agent: {
      id: number
      first_name: string
      last_name: string
      email: string
    } | null
    created_at: string
    updated_at: string
    date_closed: string | null
  }
  compact?: boolean
  onClick?: () => void
}

export function TaskCard({ task, compact = false, onClick }: TaskCardProps) {
  const statusKey = (task.status?.name?.toLowerCase() || 'new') as StatusType
  const isInProgress = statusKey === 'in progress'
  const priorityKey = (task.priority?.name?.toLowerCase() || 'medium') as PriorityType
  const impactKey = (task.impact?.name?.toLowerCase() || 'medium') as ImpactType
  const typeKey = (task.ticket_type?.name?.toLowerCase() || 'task') as TicketType
  
  const priorityColor = getPriorityColor(priorityKey, '')
  const impactColor = getImpactColor(impactKey, '')
  const typeColor = getTicketTypeColor(typeKey, '')
  
  // Get icons with fallback handling
  const priorityIcon = getPriorityIcon(priorityKey)
  const impactIcon = getImpactIcon(impactKey)
  const typeIcon = getTicketTypeIcon(typeKey)
  
  const statusBorderColor = getStatusColor(statusKey, 'border-l-4 border-l-')
  const createdAt = formatDate(task.created_at.toString())

  const clientInitials = getInitials(task.client.name)
  const assigneeInitials = task.agent ? getInitials(`${task.agent.first_name} ${task.agent.last_name}`) : '?'

  const cardStyle = cn(
    "p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200",
    "border border-gray-200 dark:border-gray-700 flex flex-col gap-2 relative overflow-hidden",
    compact ? "p-2 gap-1" : "",
    onClick && "cursor-pointer hover:translate-y-[-1px] transition-transform duration-200",
    statusBorderColor
  )

  // Function to render icon with tooltip
  const IconWithTooltip = ({ icon: Icon, color, tooltip }: { icon: any, color: string, tooltip: string }) => {
    // Return null if Icon is undefined to prevent render errors
    if (!Icon) {
      return null
    }
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center justify-center rounded-full p-0.5", 
              `text-${color} dark:text-${color}`)}>
              <Icon className={compact ? "h-3 w-3" : "h-4 w-4"} />
            </div>
          </TooltipTrigger>
          <TooltipContent className={cn(`bg-${color} text-white`)}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const ClientAvatar = ({ client }: { client: any }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(
              compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]', 
              'bg-muted', 
              client.is_client_vip && 'bg-yellow-100 dark:text-black'
            )}>
              <AvatarImage src={client.avatar_url || ''} alt={client.name} />
              <AvatarFallback className="bg-transparent">{clientInitials}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {client.name}
              {client.is_client_vip && (
                <span className="ml-1 bg-yellow-100 text-yellow-800 px-1 rounded text-[8px] font-medium">VIP</span>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const AssigneeAvatar = ({ agent }: { agent: any }) => {
    if (!agent) return null
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn(compact ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]', 'bg-muted')}>
              <AvatarFallback className="bg-transparent">{assigneeInitials}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>
            <p>{agent.first_name} {agent.last_name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cardStyle} onClick={onClick}>
      {/* Header - ID, Type, Priority, Impact */}
      <div className="flex justify-between items-center">
        <div className={cn(
          "flex items-center gap-1",
          compact ? "text-xs" : "text-sm"
        )}>
          <span className="text-muted-foreground">#{task.id}</span>
          
          {isInProgress && (
            <ClockArrowUp className={cn(
              "text-blue-500 animate-[opacity-pulse_1s_ease-in-out_infinite]",
              compact ? "h-3 w-3" : "h-4 w-4"
            )} />
          )}

          <IconWithTooltip 
            icon={typeIcon}
            color={typeColor}
            tooltip={task.ticket_type?.name}
          />
          
          <IconWithTooltip 
            icon={priorityIcon}
            color={priorityColor}
            tooltip={task.priority?.name}
          />

          <IconWithTooltip 
            icon={impactIcon}
            color={impactColor}
            tooltip={task.impact?.name}
          />

          <span className={cn(
            "text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {createdAt}
          </span>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {task.client.is_client_vip && <VipIndicator scale={compact ? 3 : 4} />}
          <ClientAvatar client={task.client} />
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <div className="text-sm font-medium line-clamp-1 text-gray-900 dark:text-gray-100 w-[200px] ">
          {task.summary}
        </div>

        <UserAvatar2 size="xs" userId={task.agent?.id} userName={task.agent?.first_name + ' ' + task.agent?.last_name} />
      </div>
    </div>
  )
}
