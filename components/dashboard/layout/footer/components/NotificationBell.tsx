import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  count?: number
}

export const NotificationBell = ({ count = 3 }: NotificationBellProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 relative bg-white text-green-500 hover:text-green-400 rounded-full"
    >
      <Bell className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {count}
        </span>
      )}
    </Button>
  )
}
