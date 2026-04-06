'use client'

import { useState, useEffect } from "react"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle
} from "react-resizable-panels"
import { useSmsStore } from "@/stores/useSmsStore"
import { ConvoList } from "../components/convo-list"
import { ConvoDetails } from "../components/convo-details"
import { ConvoForm } from "../components/convo-form"
import { ConvoFormSkeleton } from "../components/convo-form/convo-skeleton"
import { MessageCircle } from "lucide-react"

interface SMSPageProps {
  id?: string
}

export function SMSPage({ id }: SMSPageProps) {
  const { conversations } = useSmsStore()
  const conversation = id ? conversations.find(c => c.id === id) : undefined
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const renderContent = () => {
    if (isLoading) {
      return <ConvoFormSkeleton />
    }

    if (!conversation) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No conversation selected</p>
          <p className="text-sm">Choose a conversation from the list to start messaging</p>
        </div>
      )
    }

    if (conversation.messages.length === 0) {
      return (
        <ConvoForm 
          contact={{
            name: conversation.contact,
            number: '+1234567890' // This should come from your data
          }}
          messages={[]}
        >
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation by sending a message</p>
            </div>
          </div>
        </ConvoForm>
      )
    }

    return (
      <ConvoForm 
        contact={{
          name: conversation.contact,
          number: '+1234567890' // This should come from your data
        }}
        messages={conversation.messages}
      />
    )
  }

  return (
    <div className="relative">
      <PanelGroup direction="horizontal" className="">
        <Panel defaultSize={70} minSize={13} maxSize={70}>
          {renderContent()}
        </Panel>
        <PanelResizeHandle className="w-1 bg-border" />
        <Panel defaultSize={30} minSize={13} maxSize={30}>
          <ConvoDetails />
        </Panel>
      </PanelGroup>
    </div>
  )
}
