// Chat components - modular exports for easy integration
export { ChatWidget } from './subcomponents/ChatWidget';
export { ChatPanel } from './subcomponents/ChatPanel';
export { ChatList } from './subcomponents/it-heldpesk/ChatList';
export { HelpdeskChatView } from './subcomponents/it-heldpesk/HelpdeskChatView';
export { ChatMessageBubble } from './subcomponents/ChatMessageBubble';
export { ChatInput } from './subcomponents/ChatInput';
export { ChatAvatar } from './subcomponents/ChatAvatar';
export { ClientChatView } from './subcomponents/client-user/ClientChatView';
export { ChatHistory } from './subcomponents/ChatHistory';
export { QuickChatButtons } from './subcomponents/client-user/QuickChatButtons';
export { ChatPanelAttached } from './subcomponents/ChatPanelAttached';
export { ChatPanelFloating } from './subcomponents/ChatPanelFloating';
export { FileAttachment } from './subcomponents/FileAttachment';

// Page components
export { ChatPage } from './page';

// Re-export types for convenience
export type { ChatUser, ChatMessage, ChatConversation as ChatConversationType } from '@/types/chat';
