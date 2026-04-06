'use client'

import { useEffect, useState } from 'react'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { logger } from '@/lib/logger'
import { useTasksStore } from '@/stores/useTasksStore'
import { ChatWidget } from '@/components/chat'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation';

export default function NewTaskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchAllDropdowns, isLoading, setIsLoading } = useDropdownStore()
  const { user } = useAuth()
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)

  // Get current user info for chat
  const userId = user?.id || 0;
  // role_id is stored as string in User type, parse it to number
  const roleId = user?.role_id ? parseInt(String(user.role_id), 10) : 1; // Default to admin for agents area

  useEffect(() => {
    async function initializeData() {
      try {
        setIsLoading(true)
        logger.info('Initializing data...')
        await fetchAllDropdowns()
        
      } catch (error) {
        logger.error('Error initializing data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [fetchAllDropdowns, setIsLoading])

  //check for params
  const searchParams = useSearchParams()
  useEffect(() => {
    if(Boolean(searchParams.get("chat"))) {
      setShowChat(true)
    }
  }, [searchParams])
  
  return (
    <>
      {children}
      {/* Chat widget for agents - they see all client conversations */}
      <ChatWidget
        position="bottom-right"
        userId={userId}
        roleId={roleId}
        showChat={showChat}
      />
    </>
  )
}