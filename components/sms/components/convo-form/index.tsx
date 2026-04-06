'use client'

import { Archive, Search, MoreVertical, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MessageBubble, type Message } from "./message-bubble"

interface ConvoFormProps {
  contact: {
    name: string
    number: string
  }
  messages: Message[]
  children?: React.ReactNode
}

export function ConvoForm({ contact, messages, children }: ConvoFormProps) {
  const initials = contact.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium">{contact.name}</h2>
            <p className="text-sm text-muted-foreground">{contact.number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages or Empty State */}
      {children || (
        <ScrollArea className="flex-1 p-4 bg-gray-200 dark:bg-gray-500 max-h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Form */}
      <div className="p-4 border-t">
        <form className="flex gap-2">
          <Textarea 
            rows={5}
            placeholder="Type a message..." 
            className="min-h-[50px]"
          />
          <Button type="submit" size="icon" className="bg-lime-600 h-[120px] w-[44px] flex-shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
