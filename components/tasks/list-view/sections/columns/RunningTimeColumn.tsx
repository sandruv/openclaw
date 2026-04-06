import { TableCell } from "@/components/ui/table"
import { Clock, Play } from "lucide-react"

interface RunningTimeColumnProps {
  seconds?: number
  activeSeconds?: number
}

export function RunningTimeColumn({ seconds = 0, activeSeconds = 0 }: RunningTimeColumnProps) {
  // Format seconds into hours and minutes
  const formatTime = (totalSeconds: number) => {
    if (totalSeconds === 0) return "0h 0m";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  }

  const hasActiveTimer = activeSeconds > 0;

  return (
    <TableCell>
      <div className="flex flex-col items-center justify-center text-muted-foreground min-w-[90px]">
        {/* <Clock className="h-3.5 w-3.5" /> */}
        {hasActiveTimer && (
          <p className="text-sm text-red-600 dark:text-red-400 font-medium line-height-[12px] animate-pulse">
            {formatTime(activeSeconds)}
          </p>
        )}
        <p className="text-sm line-height-[12px]">{formatTime(seconds)}</p>

        {/* <div className="">
          {hasActiveTimer && (
            <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded-full animate-pulse">
              <Clock className="h-3.5 w-3.5 text-white" />
              <p className="text-xs text-white font-medium line-height-[12px]  ">
                {formatTime(activeSeconds)}
              </p>
            </div>
          )}
          <p className="text-xs line-height-[12px]">{formatTime(seconds)}</p>
        </div> */}
        
      </div>
    </TableCell>
  )
}
