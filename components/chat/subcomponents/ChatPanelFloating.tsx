'use client';

import { useState } from 'react';
import { useDashboardSettingsStore } from '@/stores/useDashboardSettingsStore';
import { useChatStore } from '@/stores/useChatStore';
import { ClientChatView } from './client-user/ClientChatView';
import { ChatHistory } from './ChatHistory';
import { cn } from '@/lib/utils';

interface FloatingChatPanelProps {
  onClose?: () => void;
  onAttachToSide?: () => void;
}

/**
 * Floating chat panel with collapsible history sidebar
 * This is the popup view shown above the footer
 */
export function ChatPanelFloating({ onClose, onAttachToSide }: FloatingChatPanelProps) {
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

  const handleClose = () => {
    updateSetting('chatOpen', false);
    onClose?.();
  };

  const handleAttachToSide = () => {
    // Close floating popup and open attached side panel
    updateSetting('chatOpen', false);
    updateSetting('chatExpanded', true);
    onAttachToSide?.();
  };

  return (
    <div className="relative flex h-full bg-transparent overflow-visible">
      {/* Main Chat View - Full Width */}
      <div className="flex-1 flex flex-col min-w-[280px]">
        <ClientChatView
          onClose={handleClose}
          onToggleExpand={handleAttachToSide}
          onToggleHistory={toggleHistory}
          isExpanded={false}
          showHistoryToggle={true}
          historyOpen={historyOpen}
        />
      </div>

      {/* Chat History Popup - Overlay on left side */}
      {!historyOpen && (
        <div className="absolute left-[-225px] top-0 h-full w-[220px] z-50">
          <ChatHistory
            onSelectConversation={handleSelectConversation}
            className="h-full rounded-l-lg"
          />
        </div>
      )}
    </div>
  );
}
