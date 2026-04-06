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
import { TaskQueueCardProps } from '@/types/tasks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { VipIndicator } from '@/components/custom/vip-indicator'
import { useLoader } from '@/contexts/LoaderContext'
import { useTimerStore } from '@/stores/useTimerStore'

// Utility function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDistanceShort(date)
}

export function TaskQueueCard({ task, collapsed }: TaskQueueCardProps) {
  const { isTimerRunning, activeTicketId } = useTimerStore()
  const hasTimerRunning = isTimerRunning && activeTicketId === task.id
  
  const statusKey = task.status?.name.toLowerCase() as StatusType
  const priorityKey = (task.priority?.name ?? 'none').toLowerCase() as PriorityType
  const impactKey = (task.impact?.name ?? 'none').toLowerCase() as ImpactType
  const typeKey = (task.ticket_type?.name ?? 'none').toLowerCase() as TicketType
  
  const priorityColor = getPriorityColor(priorityKey, '')
  const impactColor = getImpactColor(impactKey, '')
  const typeColor = getTicketTypeColor(typeKey, '')
  const priorityIcon = getPriorityIcon(priorityKey)
  const impactIcon = getImpactIcon(impactKey)
  const typeIcon = getTicketTypeIcon(typeKey)
  const statusBorderColor = getStatusColor(statusKey, 'border-l-4 border-l-')
  const createdAt = formatDate(task.created_at.toString())
  const updatedAt = formatDate(task.updated_at.toString())

  const clientInitials = getInitials(task.client?.name ?? 'none')

  const router = useRouter()
  const { setIsLoading: setRouteLoading } = useLoader()

  const handleCardClick = () => {
    setRouteLoading(true) // Show loader immediately
    router.push(`/tasks/${task.id}`)
  }

  const cardStyle = cn(
    "p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200",
    "border border-gray-10 flex flex-col gap-1 relative overflow-hidden cursor-pointer",
    "hover:translate-y-[-1px] transition-transform duration-200 mb-1",
    statusBorderColor
  )
  
  // Styles for the blinking indicator
  const indicatorStyle = cn(
    "absolute top-0 right-0 w-2 h-2 rounded-full",
    "animate-pulse-fast",
    hasTimerRunning ? "bg-green-500" : "hidden"
  )

  // Function to render icon with tooltip
  const IconWithTooltip = ({ icon: Icon, color, tooltip }: { icon: any, color: string, tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center justify-center rounded-full p-0.5", 
            `text-${color} dark:text-${color}`)}>
            <Icon className="h-3 w-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent className={cn(`bg-${color} text-white`)}>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const clientNameAvatar = ({ client }: { client: any }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className={cn('h-6 w-6 text-[10px] bg-muted', client.is_client_vip && 'bg-yellow-100 dark:text-black')}>
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

  return (
    <div className={cardStyle} onClick={handleCardClick}>
      {/* Top Section - ID & Type */}
      {collapsed && (
        <div className="flex items-center gap-1">
          {clientNameAvatar({ client: task.client })}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div className={cn(
          "flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400",
          collapsed && "gap-0"
        )}>

          {(hasTimerRunning && collapsed) && (
            <div className="text-[10px] text-blue-500 font-medium mr-1">
              <ClockArrowUp className="h-4 w-4 animate-[opacity-pulse_1s_ease-in-out_infinite]" />
            </div>
          )}

          {!collapsed && (
            <span>#{task.id}</span>
          )}

          <IconWithTooltip 
            icon={typeIcon}
            color={typeColor}
            tooltip={task.ticket_type?.name ?? 'none'}
          />
          <IconWithTooltip 
            icon={priorityIcon}
            color={priorityColor}
            tooltip={task.priority?.name ?? 'none'}
          />

          {collapsed && (
            <div className="w-1"></div>
          )}

          <IconWithTooltip 
            icon={impactIcon}
            color={impactColor}
            tooltip={task.impact?.name ?? 'none'}
          />

          <p className="text-xs">{createdAt}</p>
        </div>
        
        <div className="flex items-center gap-1">
          
          {task.client?.is_client_vip && <VipIndicator scale={4} />}
          {task.client && (
            clientNameAvatar({ client: task.client })
          )}
        </div>
      </div>
      
      {/* Summary Section */}
      { !collapsed && (
        <div className="flex items-center gap-1">
          {hasTimerRunning && (
            <div className="text-[10px] text-blue-500 font-medium mr-1">
              <ClockArrowUp className="h-4 w-4 animate-[opacity-pulse_1s_ease-in-out_infinite]" />
            </div>
          )}

          <div className="text-xs font-medium line-clamp-1">{task.summary}</div>
        </div>
      )}
    </div>
  )
}
