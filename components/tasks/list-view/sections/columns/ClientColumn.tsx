'use client'

import { TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { VipIndicator } from "@/components/custom/vip-indicator"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ClientColumnProps {
  client: {
    name: string
    is_client_vip?: boolean
  }
}

export function ClientColumn({ client }: ClientColumnProps) {
  const { compactMode } = useSettingsStore()
  
  return (
    <TableCell>
      {compactMode ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <div className={cn(
                  "relative bg-neutral-700 text-white p-1 border-[1px]",
                  (client?.is_client_vip ?? false) && "border-amber-200",
                  "px-2 rounded"
                )}>
                  {client?.name.slice(0, 4).toUpperCase() ?? 'None'}

                  {(client?.is_client_vip ?? false) && (
                    <VipIndicator 
                      className="absolute -top-2 -right-3 text-[8px] w-5 h-5" 
                      scale={5} 
                      rounded="full" 
                    />
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent 
              className={cn(
                "border",
                client?.is_client_vip ?? false
                  ? "bg-amber-50 text-amber-800 border-amber-200" 
                  : "bg-gray-50 text-gray-900 border-gray-200"
              )}
              side="top"
              align="start"
            >
              <p className="font-medium">{client?.name ?? 'None'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="flex items-center">
          <div className={cn(
            "relative bg-neutral-700 text-white p-1 border-[1px]",
            (client?.is_client_vip ?? false) && "border-amber-200",
            "w-7 h-7 rounded-full flex items-center justify-center"
          )}>
            {client?.name.slice(0, 2).toUpperCase() ?? 'NN'}

            {(client?.is_client_vip ?? false) && (
              <VipIndicator 
                className="absolute -top-2 -right-3 text-[8px] w-5 h-5" 
                scale={5} 
                rounded="full" 
              />
            )}
          </div>
          
          <span className="ml-2 text-sm font-medium truncate max-w-[100px]">
            {client?.name ?? 'None'}
          </span>
        </div>
      )}
    </TableCell>
  )
}
