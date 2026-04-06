'use client'

import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { VipIndicator } from '@/components/custom/vip-indicator'
import { Client } from '@/types/clients'

interface ClientSectionProps {
  client: Client;
}

export function ClientSection({ client }: ClientSectionProps) {
  const clientInitial = getInitials(client.name)
  const clientIsVip = client.is_client_vip

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center border-yellow-200">
            <Avatar className={cn("h-6 w-6 border-[1px]", clientIsVip && "border-amber-200")}>
              <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 dark:text-gray-300">
                {clientInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium dark:text-gray-300" style={{transform: "translateX(-3px)"}}>
              {clientIsVip && <VipIndicator rounded="lg" scale={5} />}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className={cn(
          clientIsVip ? "bg-amber-200 text-gray-900" : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
        )}>
          {client.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
