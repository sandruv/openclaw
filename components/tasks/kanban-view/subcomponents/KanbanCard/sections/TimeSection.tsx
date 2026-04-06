import { Clock } from 'lucide-react'
import { formatDurationShorter, formatDurationShort } from '@/lib/dateTimeFormat'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { TaskStatusType } from '@/lib/taskStatusIdProvider'
import { cn } from '@/lib/utils'


interface TimeSectionProps {
  totalTimeSeconds: number
  status: TaskStatusType
  activeSeconds?: number
}

export function TimeSection({ totalTimeSeconds, status, activeSeconds = 0 }: TimeSectionProps) {
  const { compactMode } = useSettingsStore()
  
  const isInProgress = status === TaskStatusType.InProgress
  const hasActiveTimer = activeSeconds > 0 && isInProgress
  
  // Show active timer if available and in progress, otherwise show total time
  const displaySeconds = hasActiveTimer ? activeSeconds : totalTimeSeconds
  
  if (!displaySeconds || displaySeconds === 0) {
    return null
  }

  const expandedTime = formatDurationShort(displaySeconds)
  const compactTime = formatDurationShorter(displaySeconds)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-black dark:bg-gray-600 dark:text-white text-xs font-medium", 
              hasActiveTimer && "bg-red-500 text-white dark:bg-red-500 dark:text-white animate-pulse"
            )}>
            <Clock className="h-3 w-3" />
            <span>{compactMode && compactTime || expandedTime}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasActiveTimer ? 'Active timer running' : 'Total accrued time'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
