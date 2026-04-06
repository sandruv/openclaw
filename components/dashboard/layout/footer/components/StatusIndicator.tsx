import { Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const StatusIndicator = () => {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-10 relative bg-white text-green-500 hover:text-green-400 rounded-lg"
      >
        <Circle className="h-6 w-6" />
      </Button>
    </div>
  )
}
