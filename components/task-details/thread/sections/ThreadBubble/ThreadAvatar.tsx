import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarColor, getInitials } from "@/lib/utils"
import { ActivityData } from "./types"
import { isClientMessage, getClientDisplayInfo } from "./utils"

interface ThreadAvatarProps {
  activity: ActivityData
  taskUserEmail?: string
  taskUserFirstName?: string
  taskUserLastName?: string
  taskUserId?: number
  useUserInfoForDisplay?: boolean
}

export function ThreadAvatar({ 
  activity, 
  taskUserEmail,
  taskUserFirstName,
  taskUserLastName,
  taskUserId,
  useUserInfoForDisplay = false
}: ThreadAvatarProps) {
  const isClient = isClientMessage(activity, taskUserEmail)
  const clientInfo = isClient ? getClientDisplayInfo(activity, taskUserEmail, taskUserFirstName, taskUserLastName) : null

  // For Principal Request tickets, use user info for display
  const displayInitials = useUserInfoForDisplay && taskUserFirstName
    ? getInitials(`${taskUserFirstName} ${taskUserLastName || ''}`)
    : isClient 
      ? (clientInfo?.initials || 'C') 
      : getInitials(`${activity.agent?.first_name} ${activity.agent?.last_name}`)

  // Use the user's avatar color for Principal Request tickets
  const avatarColor = useUserInfoForDisplay && taskUserId
    ? getAvatarColor(taskUserId)
    : isClient 
      ? 'bg-purple-400' 
      : getAvatarColor(activity.agent?.id)

  return (
    <div>
      <Avatar>
        <AvatarFallback className={`${avatarColor} text-white font-bold`}>
          {displayInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
