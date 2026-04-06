/**
 * Utility functions for conversation panel
 */

export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}min ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
};

export const getConversationTitle = (conversation: {
  messages: Array<{ role: string; content: string }>;
}) => {
  const firstUserMessage = conversation.messages.find(m => m.role === 'user');
  if (firstUserMessage?.content) {
    return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
  }
  return 'New Conversation';
};

export const getConversationPreview = (conversation: {
  messages: Array<{ role: string; content: string }>;
}) => {
  const lastAssistantMessage = [...conversation.messages].reverse().find(m => m.role === 'assistant');
  if (lastAssistantMessage?.content) {
    return lastAssistantMessage.content.slice(0, 80) + (lastAssistantMessage.content.length > 80 ? '...' : '');
  }
  return 'No response yet';
};
