import { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search } from 'lucide-react';
import { useConvoStore } from '@/stores/useConvoStore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ConversationItem } from './ConversationItem';
import { getConversationTitle, getConversationPreview } from './utils'

interface ConversationPanelProps {
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string;
}

export function ConversationPanel({ onSelectConversation, activeConversationId }: ConversationPanelProps) {
  const { conversations, createNewConversation, loadAllConversations, togglePin } = useConvoStore();
  const [searchQuery, setSearchQuery] = useState('');
  const themeColor = useThemeColor();

  useEffect(() => {
    loadAllConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewConversation = () => {
    const newConvoId = createNewConversation();
    if (newConvoId) {
      onSelectConversation(newConvoId);
    }
  };


  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      const title = getConversationTitle(conv).toLowerCase();
      const preview = getConversationPreview(conv).toLowerCase();
      return title.includes(query) || preview.includes(query);
    });
  }, [conversations, searchQuery]);

  // Separate pinned and unpinned conversations
  const { pinnedConversations, historyConversations } = useMemo(() => {
    const pinned = filteredConversations.filter(conv => conv.isPinned);
    const history = filteredConversations.filter(conv => !conv.isPinned);
    
    return { pinnedConversations: pinned, historyConversations: history };
  }, [filteredConversations]);


  return (
    <div className="flex flex-col h-full bg-gray-100 px-2">
      {/* Header Actions */}
      <div className="rounded-t-[20px] bg-white h-full">
        <div className="p-5 space-y-2">
          <button 
            onClick={handleNewConversation} 
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/50 rounded-md transition-colors"
          >
            <MessageSquare className="w-4 h-4" color={themeColor.base} />
            New Chat
          </button>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" color={themeColor.base} />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div>
            {conversations.length === 0 && (
              <div className="flex items-center justify-center py-8 px-4">
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )}

            {/* Pinned Section */}
            {pinnedConversations.length > 0 && (
              <>
                <div className="px-4 py-2 border-b" style={{ borderColor: themeColor.base, color: themeColor.text }}>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Pinned
                  </span>
                </div>
                <div className="">
                  {pinnedConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      isActive={activeConversationId === conversation.id}
                      onSelect={onSelectConversation}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Chat History Section */}
            {historyConversations.length > 0 && (
              <>
                <div className="px-4 py-2 mt-4 border-b" style={{ borderColor: themeColor.base, color: themeColor.text }}>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Chat History
                  </span>
                </div>
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto styled-scrollbar">
                  {historyConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      isActive={activeConversationId === conversation.id}
                      onSelect={onSelectConversation}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Show all if no categorization needed */}
            {pinnedConversations.length === 0 && historyConversations.length === 0 && filteredConversations.length > 0 && (
              <>
                <div className="px-4 py-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Conversations
                  </span>
                </div>
                <div className="border-l border-muted ml-4">
                  {filteredConversations.map((conversation) => (
                    <ConversationItem 
                      key={conversation.id} 
                      conversation={conversation}
                      isActive={activeConversationId === conversation.id}
                      onSelect={onSelectConversation}
                      onTogglePin={togglePin}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
