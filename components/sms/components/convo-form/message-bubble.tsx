'use client'

import { cn } from "@/lib/utils"

export interface Message {
  id: string
  content: string
  timestamp: string
  isOutbound: boolean
}

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={cn(
      "flex gap-2 w-full",
      message.isOutbound ? "justify-end" : ""
    )}>
      <div className={cn(
        "rounded-lg p-3 max-w-[80%] shadow-md",
        message.isOutbound 
          ? "bg-green-100 dark:bg-green-900" 
          : "bg-background dark:bg-gray-800"
      )}>
        <p className="text-sm">{message.content}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </p>
      </div>
    </div>
  )
}
