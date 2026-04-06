'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskGroupSectionProps {
  title: string
  count: number
  children: React.ReactNode
  defaultExpanded?: boolean
  colSpan?: number
}

export function TaskGroupSection({ 
  title, 
  count, 
  children, 
  defaultExpanded = true,
  colSpan = 12
}: TaskGroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <>
      <tr 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "cursor-pointer select-none",
          "bg-muted/50 hover:bg-muted transition-colors",
          "border-b border-border"
        )}
        data-testid="task-group-header"
      >
        <td colSpan={colSpan} className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold text-foreground">{title}</span>
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {count}
            </span>
          </div>
        </td>
      </tr>
      {isExpanded && children}
    </>
  )
}
