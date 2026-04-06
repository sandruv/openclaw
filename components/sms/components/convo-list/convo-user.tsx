'use client'

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ConvoUserProps {
  contact: string
  lastMessage?: string
  timestamp?: string
  className?: string
  isSelected?: boolean
  onClick?: () => void
}

const formatMessageDate = (timestamp: string) => {
  const messageDate = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60))
  const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 60) {
    return diffInMinutes <= 5 ? "just now" : `${diffInMinutes}m`
  }
  
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' })
  }
  
  return messageDate.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  })
}

export function ConvoUser({ contact, lastMessage, timestamp, className, isSelected, onClick }: ConvoUserProps) {
  const [formattedDate, setFormattedDate] = useState<string>("")
  const isPhoneNumber = /^\+?\d+$/.test(contact.trim())
  const initials = isPhoneNumber ? undefined : contact
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    if (timestamp) {
      setFormattedDate(formatMessageDate(timestamp))
    }
  }, [timestamp])

  // Update the time every minute for recent messages
  useEffect(() => {
    if (!timestamp) return

    const messageDate = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60))

    // Only set up interval for messages less than an hour old
    if (diffInMinutes < 60) {
      const interval = setInterval(() => {
        setFormattedDate(formatMessageDate(timestamp))
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [timestamp])

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-none transition-colors hover:bg-accent flex items-start gap-3",
        isSelected && "bg-accent",
        className
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10">
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <div className="font-medium truncate">
            {contact}
          </div>
          {formattedDate && (
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {formattedDate}
            </div>
          )}
        </div>
        {lastMessage && (
          <div className="text-xs text-muted-foreground truncate">
            {lastMessage}
          </div>
        )}
      </div>
    </button>
  )
}