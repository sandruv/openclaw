import { cn } from "@/lib/utils"

interface IndeterminateProgressProps {
  className?: string
  barClassName?: string
  color?: "blue" | "green" | "red" | "yellow" | "purple"
}

export function IndeterminateProgress({ 
  className, 
  barClassName,
  color = "green" 
}: IndeterminateProgressProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500"
  }

  return (
    <div className={cn(
      "w-full h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden mb-0",
      className
    )}>
      <div className={cn(
        "h-1 animate-indeterminate-progress",
        colorClasses[color],
        barClassName
      )} />
    </div>
  )
}
