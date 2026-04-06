import { format } from "date-fns"
import { ActivityData } from "./types"

interface ThreadTimestampProps {
  activity: ActivityData
}

export function ThreadTimestamp({ activity }: ThreadTimestampProps) {
  return (
    <div className="">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {format(new Date(activity.date_start), "M/d/yyyy | h:mm a")}
      </p>
    </div>
  )
}
