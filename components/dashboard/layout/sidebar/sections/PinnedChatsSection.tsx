import { ChatLink } from "../components"
import { useConvoStore } from "@/stores/useConvoStore"
import { useRouter } from "next/navigation"

interface PinnedChatsSectionProps {
  isCollapsed: boolean
}

export const PinnedChatsSection = ({ isCollapsed }: PinnedChatsSectionProps) => {
  const router = useRouter()
  const { conversations, loadConversation } = useConvoStore()
  
  const pinnedConversations = conversations.filter(conv => conv.isPinned)
  
  if (pinnedConversations.length === 0) {
    return null
  }
  
  const handleChatClick = (conversationId: string) => {
    loadConversation(conversationId)
    router.push('/assistant')
  }
  
  const getConversationLabel = (conv: typeof conversations[0]) => {
    if (conv.messages.length === 0) {
      return 'New conversation'
    }
    const firstUserMessage = conv.messages.find(m => m.role === 'user')
    return firstUserMessage?.content.slice(0, 50) || 'Conversation'
  }
  
  return (
    <div className="px-3 py-2 pl-6">
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground border-muted-foreground">
            Pinned Chats
          </span>
        </div>
      )}
      <div className="h-px bg-gray-200 dark:bg-gray-800 ml-3"></div>
      <nav className="flex flex-col gap-0.5">
        {pinnedConversations.map((conv) => (
          <ChatLink
            key={conv.id}
            label={getConversationLabel(conv)}
            isCollapsed={isCollapsed}
            onClick={() => handleChatClick(conv.id)}
          />
        ))}
      </nav>
    </div>
  )
}
