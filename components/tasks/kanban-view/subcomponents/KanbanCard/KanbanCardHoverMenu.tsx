'use client'

import { cn, getAvatarColor, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getStatusColor, StatusType } from '@/lib/taskUtils'
import { KanbanCardProps } from '@/types/kanban'
import { User2 } from 'lucide-react'
import { VipIndicator } from '@/components/custom/vip-indicator' 

interface KanbanCardHoverMenuProps {
  task: KanbanCardProps['task'];
  isVisible: boolean;
  position: { x: number; y: number };
}

export function KanbanCardHoverMenu({ task, isVisible, position }: KanbanCardHoverMenuProps) {

  const statusKey = task.status.name.toLowerCase() as StatusType
  const statusColor = getStatusColor(statusKey, 'bg-')
  
  // Get agent info
  const agent = task.agent
  const agentInitial = agent ? getInitials(`${agent.first_name} ${agent.last_name}`) : ''
  const agentFullName = agent ? `${agent.first_name} ${agent.last_name}` : 'Unassigned'
  const userColor = agent ? getAvatarColor(agent.id) : ''

  // Get client info
  const client = task.client
  const clientIsVip = client?.is_client_vip

  return (
    <div 
      className={cn(
        "fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-[280px] translate-x-[-50%]",
        "transition-all duration-300 ease-out",
        isVisible 
          ? "opacity-100 translate-y-[120%]" 
          : "opacity-0 translate-y-[100%] pointer-events-none"
      )}
      style={{
        left: position.x,
        top: position.y,
        marginTop: '-12px'
      }}
    >
      {/* Status Section */}
      <div className="flex items-center gap-2 mb-2">
        <Badge 
          variant="secondary" 
          className={cn(
            "text-white font-medium",
            statusColor
          )}
        >
          {task.status.name}
        </Badge>

        <div className="flex items-center gap-2">
          {agent ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarFallback className={cn("text-xs text-white", userColor)}>
                  {agentInitial}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-900 dark:text-gray-100">{agentFullName}</span>
            </>
          ) : (
            <>
              <User2 className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
            </>
          )}
        </div>
      </div>

      {/* Client Section */}
      {client && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Client:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900 dark:text-gray-100">{client.name}</span>
            {clientIsVip && (
              <VipIndicator rounded="lg" scale={5} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
