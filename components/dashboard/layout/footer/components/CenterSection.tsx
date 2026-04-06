import { NotificationBell } from './NotificationBell'
import { AlertMessage } from './AlertMessage'

export const CenterSection = () => {
  return (
    <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-full">
      <NotificationBell count={3} />
      <AlertMessage />
    </div>
  )
}
