import { useState } from "react"
import { cn } from "@/lib/utils"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ActivityData, ImageDialogState } from "./types"
import { isClientMessage } from "./utils"
import { ImageDialog } from "./ImageDialog"
import { ThreadAvatar } from "./ThreadAvatar"
import { ThreadHeader } from "./ThreadHeader"
import { ThreadTimestamp } from "./ThreadTimestamp"
import { ThreadContent } from "./ThreadContent"
import { ThreadAttachments } from "./ThreadAttachments"
import '@/styles/thread-content.css'

interface ThreadBubbleProps {
  activity: ActivityData
  compactMode: boolean
  taskUserEmail?: string
  taskUserFirstName?: string
  taskUserLastName?: string
  taskUserId?: number
  onImageClick: (src: string, alt: string) => void
  useUserInfoForDisplay?: boolean
}

function ThreadBubble({ 
  activity, 
  compactMode,
  taskUserEmail,
  taskUserFirstName,
  taskUserLastName,
  taskUserId,
  onImageClick,
  useUserInfoForDisplay = false
}: ThreadBubbleProps) {
  const isClient = isClientMessage(activity, taskUserEmail)

  return (
    <div className={cn(
      "mb-2 flex mt-2",
      isClient ? 'justify-start' : 'justify-end'
    )}>
      <div className={cn(
        "rounded-lg p-4 w-[90%] border-gray-200 border",
        isClient
          ? 'bg-purple-100 dark:bg-purple-900/50 dark:border-purple-800/50'
          : 'bg-blue-50 dark:bg-blue-900/50 dark:border-blue-800/50'
      )}>
        <div className="flex items-center space-x-2">
          <ThreadAvatar 
            activity={activity}
            taskUserEmail={taskUserEmail}
            taskUserFirstName={taskUserFirstName}
            taskUserLastName={taskUserLastName}
            taskUserId={taskUserId}
            useUserInfoForDisplay={useUserInfoForDisplay}
          />
          <div>
            <ThreadHeader 
              activity={activity}
              compactMode={compactMode}
              taskUserEmail={taskUserEmail}
              taskUserFirstName={taskUserFirstName}
              taskUserLastName={taskUserLastName}
              useUserInfoForDisplay={useUserInfoForDisplay}
            />
            <ThreadTimestamp activity={activity} />
          </div>
        </div>
        
        <ThreadContent 
          activity={activity}
          onImageClick={onImageClick}
        />
        
        <ThreadAttachments activity={activity} />
      </div>
    </div>
  )
}

export function Thread() {
  const { task } = useTaskDetailsStore()
  const { compactMode } = useSettingsStore()
  const [imageDialog, setImageDialog] = useState<ImageDialogState>({
    open: false,
    src: "",
    alt: ""
  })

  if (!task?.activities) {
    return null
  }

  // Sort activities by date_start in descending order (newest first)
  const sortedActivities = [...task.activities].sort((a, b) => {
    return new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
  })

  // Check if this is a Principal Request ticket (ticket_source_id=5, ticket_type_id=4, user.client_id=1)
  // Using optional chaining since these fields may not be in the base Task type
  const taskWithSource = task as typeof task & { ticket_source_id?: number; ticket_type_id?: number }
  const isPrincipalRequest = taskWithSource.ticket_source_id === 5 && 
                             taskWithSource.ticket_type_id === 4 && 
                             task.user?.email.includes("@yanceyworks.com")

  // Handle opening the image dialog
  const handleImageClick = (src: string, alt: string = "Image") => {
    setImageDialog({
      open: true,
      src,
      alt
    })
  }

  // Close the image dialog
  const closeImageDialog = () => {
    setImageDialog({
      ...imageDialog,
      open: false
    })
  }

  return (
    <>
      <ImageDialog 
        imageDialog={imageDialog}
        onClose={closeImageDialog}
        onOpenChange={(open) => setImageDialog({ ...imageDialog, open })}
      />

      {sortedActivities.map((activity, index) => {
        // For Principal Request tickets, the first activity (oldest) should show user info
        const isFirstActivity = index === sortedActivities.length - 1
        const shouldUseUserInfo = isPrincipalRequest && isFirstActivity

        return (
          <ThreadBubble
            key={activity.id}
            activity={activity}
            compactMode={compactMode}
            taskUserEmail={task?.user?.email}
            taskUserFirstName={task?.user?.first_name}
            taskUserLastName={task?.user?.last_name}
            taskUserId={task?.user?.id}
            onImageClick={handleImageClick}
            useUserInfoForDisplay={shouldUseUserInfo}
          />
        )
      })}
    </>
  )
}
