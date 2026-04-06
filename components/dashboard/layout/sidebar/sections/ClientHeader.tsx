'use client'

import { cn } from "@/lib/utils"
import { Client } from "@/types/clients"
import { useThemeColor } from "@/hooks/useThemeColor"

interface ClientHeaderProps {
  client: Client | null
  isCollapsed: boolean
}

export const ClientHeader = ({ client, isCollapsed }: ClientHeaderProps) => {
  const themeColor = useThemeColor()
  
  const getClientDisplayName = () => {
    if (!client) return 'Portal'
    if (isCollapsed) {
      return client.internal_code || client.internal_name?.substring(0, 2).toUpperCase() || client.name.substring(0, 2).toUpperCase()
    }
    return client.internal_name || client.name
  }

  return (
    <div className={cn(
      "flex items-center p-4",
      isCollapsed ? "justify-center" : "gap-3"
    )}>
      <div 
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold flex-shrink-0"
        style={{ backgroundColor: themeColor.base }}
      >
        {client?.internal_code?.substring(0, 2).toUpperCase() || 
         client?.internal_name?.substring(0, 2).toUpperCase() || 
         client?.name?.substring(0, 2).toUpperCase() || 
         'YW'}
      </div>
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{getClientDisplayName()}</span>
          {client?.internal_name && client.name !== client.internal_name && (
            <span className="text-xs text-muted-foreground truncate">{client.name}</span>
          )}
        </div>
      )}
    </div>
  )
}
