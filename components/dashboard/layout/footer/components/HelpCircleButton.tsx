import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const HelpCircleButton = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 text-green-500 hover:text-green-400 hover:bg-zinc-800 p-0"
    >
      <HelpCircle style={{ width: '20px', height: '20px' }} />
    </Button>
  )
}
