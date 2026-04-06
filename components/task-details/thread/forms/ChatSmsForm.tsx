'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, MessageSquare, Send, Phone } from 'lucide-react'

interface ChatSmsFormProps {
  onSubmit: (data: { message: string; isChat: boolean; phoneNumber: string }) => void
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

export function ChatSmsForm({ onSubmit, isCollapsed, onCollapsedChange }: ChatSmsFormProps) {
  const [isChat, setIsChat] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      message,
      isChat,
      phoneNumber
    })
    setMessage('')
  }

  if (isCollapsed) {
    return (
      <Button 
        size="icon" 
        className="absolute rounded-xl bg-lime-700 hover:bg-lime-600 dark:bg-lime-800 dark:hover:bg-lime-700 right-4 bottom-4" 
        onClick={() => onCollapsedChange(false)}
      >
        <MessageSquare className="h-4 w-4 text-white" />
      </Button>
    )
  }

  return (
    <form className="flex flex-col gap-2 p-2 px-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="chat"
              className="h-4 w-4"
              checked={isChat}
              onCheckedChange={(checked) => setIsChat(checked as boolean)}
            />
            <label className="text-sm dark:text-gray-300" htmlFor="chat">Chat</label>
          </div>
          <div className="relative">
            <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
            <Input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isChat}
              className="w-[200px] h-[30px] text-sm placeholder:text-sm pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
        <Button 
          type="button"
          variant="ghost" 
          size="icon"
          onClick={() => onCollapsedChange(true)}
          className="dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2">
        <Textarea 
          rows={4}
          placeholder="Type a message..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none pr-12 focus:border-lime-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-lime-600"
        />
        <Button type="submit" size="icon" className="bg-lime-600 hover:bg-lime-500 dark:bg-lime-700 dark:hover:bg-lime-600 dark:text-white h-[100px] w-[40px] flex-shrink-0">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
