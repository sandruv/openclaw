import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_COLORS } from "@/constants/colors"
import { ActivityData } from "./types"
import { isClientMessage, getClientDisplayInfo } from "./utils"

interface ThreadHeaderProps {
  activity: ActivityData
  compactMode: boolean
  taskUserEmail?: string
  taskUserFirstName?: string
  taskUserLastName?: string
  useUserInfoForDisplay?: boolean
}

export function ThreadHeader({ 
  activity, 
  compactMode,
  taskUserEmail,
  taskUserFirstName,
  taskUserLastName,
  useUserInfoForDisplay = false
}: ThreadHeaderProps) {
  const isClient = isClientMessage(activity, taskUserEmail)
  const clientInfo = isClient ? getClientDisplayInfo(activity, taskUserEmail, taskUserFirstName, taskUserLastName) : null

  // For Principal Request tickets, use user name for display
  const displayName = useUserInfoForDisplay && taskUserFirstName
    ? `${taskUserFirstName} ${taskUserLastName || ''}`.trim()
    : isClient 
      ? (clientInfo?.name || 'Client') 
      : `${activity.agent?.first_name} ${activity.agent?.last_name}`

  // Get status color with null check and fallback
  const getStatusColor = () => {
    if (!activity.status?.name) return "bg-gray-500"
    const statusKey = activity.status.name.toLowerCase() as keyof typeof STATUS_COLORS
    return STATUS_COLORS[statusKey] || "bg-gray-500"
  }

  return (
    <div>
      <div className="flex items-end">
        <p className="text-md font-semibold mr-2 dark:text-gray-100">
          {displayName}
        </p>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
            {activity.activity_type.name}
          </Badge>
          {activity.status && (
            <Badge className={cn(
              "text-xs", compactMode && "w-10 h-3",
              getStatusColor()
            )}>
              {!compactMode && activity.status.name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
