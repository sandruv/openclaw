'use client'

import { useState, useEffect } from 'react'
import { LogoSection, CenterSection, StatusIndicator, RightSection } from './components'
import { ChatPanel } from '@/components/chat/subcomponents/ChatPanel'
import { ChatPanelFloating } from '@/components/chat/subcomponents/ChatPanelFloating'
import { useAuth } from '@/contexts/AuthContext'
import { useChatStore } from '@/stores/useChatStore'
import { useChatPusher } from '@/hooks/useChatPusher'
import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore'

export function DashboardFooter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user } = useAuth()
  const { initializeChat, isAgent } = useChatStore()
  const { settings, updateSetting } = useDashboardSettingsStore()
  
  // Use store state for chat
  const isChatOpen = settings.chatOpen
  const isChatExpanded = settings.chatExpanded

  // Initialize chat store when user is available
  useEffect(() => {
    if (user && user.id > 0) {
      const roleId = parseInt(user.role_id) 
      initializeChat(user.id, roleId)
    }
  }, [user, initializeChat])

  // Connect to Pusher for real-time chat updates
  useChatPusher()

  // Time update interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleChat = () => {
    // If chat is expanded (attached to side), close it completely
    if (isChatExpanded) {
      updateSetting('chatExpanded', false)
      updateSetting('chatOpen', false)
    } else {
      // Toggle floating popup
      updateSetting('chatOpen', !isChatOpen)
    }
  }
  
  const closeChat = () => {
    updateSetting('chatOpen', false)
  }
  
  const handleAttachToSide = () => {
    // Close floating popup and open attached side panel
    updateSetting('chatOpen', false)
    updateSetting('chatExpanded', true)
  }

  return (
    <>
      {/* Floating Chat Panel - Positioned above footer (when not expanded/attached) */}
      {isChatOpen && !isChatExpanded && (
        <div className="fixed bottom-[50px] right-2 w-[400px] h-[600px] z-50">
            <ChatPanelFloating onClose={closeChat} onAttachToSide={handleAttachToSide} />
        </div>
      )}
      
      <footer className="h-[50px] bg-zinc-900 dark:bg-zinc-950 border-t border-zinc-800 dark:border-zinc-900 flex items-center justify-between px-4 z-10 shrink-0">
        <LogoSection />
        <CenterSection />
        <StatusIndicator />
        <RightSection currentTime={currentTime} onChatToggle={toggleChat} isChatActive={isChatOpen || isChatExpanded} />
      </footer>
    </>
  )
}
