import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VipIndicatorProps {
  className?: string
  scale?: number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

export function VipIndicator({ className, scale = 6, rounded = 'md' }: VipIndicatorProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        `w-${scale} h-${scale} p-0.5 bg-amber-100 hover:bg-amber-100 border-0`,
        "text-amber-500 hover:text-amber-500 text-xs",
        `rounded-${rounded}`,
        className
      )}
    >
      <Crown style={{ height: `${scale * 2.4}px` }}/>
    </Button>
  )
}
