import { Attachments } from "../Attachments"
import { ActivityData } from "./types"

interface ThreadAttachmentsProps {
  activity: ActivityData
}

export function ThreadAttachments({ activity }: ThreadAttachmentsProps) {
  if (!activity.files || activity.files.length === 0) {
    return null
  }

  return <Attachments files={activity.files} />
}
