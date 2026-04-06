'use client'

import { ChatLanding } from './subcomp/ChatLanding'
import { BookmarksSection } from './sections/BookmarksSection'
// import { ToolsSection } from './sections/tools'
import { YWPortalTools } from './sections/YWPortalTools'
import { useAISdkStore } from '@/stores/useAISdkStore'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export const DashboardIndex = () => {
  const router = useRouter()
  const aiSdkStore = useAISdkStore()
  const { user } = useAuth()

  const handleStartChat = async (initialMessage: string) => {
    if (!initialMessage.trim()) return;
    
    // Navigate to chat-search page
    router.push('/dashboard/assistant')

    // Set thinking state immediately before making the API call
    aiSdkStore.setThinking(true);
    
    // Store the message in AI store first
    aiSdkStore.generateResponse({
      messages: [{ role: 'user', content: initialMessage }]
    });
    
    
  }

  return (
    <div className="flex flex-col lg:flex-row w-full h-full gap-4 p-4">
      <div className="w-full lg:w-[80%] xl:w-[90%] space-y-4 h-auto lg:h-[calc(100vh-105px)] flex flex-col">

        {/* Welcome Banner with Background Image */}
        <div 
          className="relative rounded-lg overflow-hidden h-32 flex items-center justify-center min-h-[100px]"
          style={{
            backgroundImage: 'url(https://picsum.photos/id/444/1200/300)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <h1 className="relative text-3xl md:text-4xl font-bold text-white z-10">
            Welcome, {user?.first_name || 'User'}!
          </h1>
        </div>

        <div className="bg-transparent flex-1 pt-10">
          <ChatLanding onStartChat={handleStartChat} />
        </div>
        <div className="bg-transparent rounded-lg shadow-sm flex-1">
          <BookmarksSection />
        </div>
        {/* <div className="bg-background rounded-lg shadow-sm flex-1">
          <ToolsSection />
        </div> */}
      </div>
    </div>
  )
}

export default DashboardIndex
