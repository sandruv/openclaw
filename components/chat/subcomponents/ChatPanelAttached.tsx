'use client';

import { useState } from 'react';
import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore';
import { useChatStore } from '@/stores/useChatStore';
import { ClientChatView } from './client-user/ClientChatView';
import { ChatHistory } from './ChatHistory';
import { cn } from '@/lib/utils';

interface ChatPanelAttachedProps {
  onClose?: () => void;
  onDetach?: () => void;
}

/**
 * Expanded chat panel with chat history sidebar
 * Attaches to the right side of the main content area
 */
export function ChatPanelAttached({ onClose, onDetach }: ChatPanelAttachedProps) {
  const { settings, updateSetting } = useDashboardSettingsStore();
  const { openConversation } = useChatStore();
  const [historyOpen, setHistoryOpen] = useState(settings.chatHistoryOpen);

  const toggleHistory = () => {
    const newValue = !historyOpen;
    setHistoryOpen(newValue);
    updateSetting('chatHistoryOpen', newValue);
  };

  const handleSelectConversation = (conversationId: number) => {
    openConversation(conversationId);
  };

  // Close expanded panel completely
  const handleClose = () => {
    updateSetting('chatExpanded', false);
    updateSetting('chatOpen', false);
    onClose?.();
  };

  // Detach from side and return to floating popup
  const handleDetach = () => {
    updateSetting('chatExpanded', false);
    updateSetting('chatOpen', true);
    onDetach?.();
  };

  return (
    <div className="relative flex h-full bg-gray-100 shadow-lg">
      {/* Main Chat View - Full Width */}
      <div className="flex-1 flex flex-col min-w-[280px] rounded-tl-xl ">
        <ClientChatView
          onClose={handleClose}
          onToggleExpand={handleDetach}
          onToggleHistory={toggleHistory}
          isExpanded={true}
          showHistoryToggle={true}
          historyOpen={historyOpen}
        />
      </div>

      {/* Chat History Popup - Overlay on left side */}
      {historyOpen && (
        <div className="absolute left-[-225px] top-0 h-[calc(50vh)] min-h-[400px] w-[220px] z-50 shadow-2xl rounded-xl overflow-hidden">
          <ChatHistory
            onSelectConversation={handleSelectConversation}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
