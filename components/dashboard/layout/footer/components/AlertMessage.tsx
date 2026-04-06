import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AlertMessageProps {
  message?: string
}

export const AlertMessage = ({ message = "We think you'll be interested in this..." }: AlertMessageProps) => {
  return (
    <Button 
      variant="ghost"
      className="h-7 w-auto bg-white"
    >  
      <AlertTriangle className="h-2 w-2 text-yellow-500" />
      <span className="text-black text-[9px]">{message}</span>
    </Button>
  )
}
