'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/chatService';
import { useChatStore } from '@/stores/useChatStore';
import { ChatUser } from '@/types/chat';

interface ChatAvatarProps {
  /** User to display - can be ChatUser or a display object with name */
  user: ChatUser | { name: string; avatar?: string; id?: number } | null;
  size?: 'sm' | 'md' | 'lg';
  showOnlineStatus?: boolean;
  /** Override online status (if not provided, will check store) */
  isOnline?: boolean;
  /** User ID to check online status (if different from user.id) */
  userId?: number;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const indicatorSizes = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function ChatAvatar({
  user,
  size = 'md',
  showOnlineStatus = false,
  isOnline: isOnlineOverride,
  userId,
}: ChatAvatarProps) {
  const { isUserOnline } = useChatStore();
  
  // Get display name - handle both old and new user types
  const displayName = user
    ? 'name' in user
      ? user.name
      : chatService.getUserDisplayName(user as ChatUser)
    : 'Unknown';

  // Get initials
  const initials = chatService.getUserInitials(
    user && !('name' in user) ? (user as ChatUser) : null
  ) || displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // Get avatar URL if available
  const avatarUrl = user && 'avatar' in user ? user.avatar : undefined;
  
  // Determine user ID for online check
  const checkUserId = userId ?? (user && 'id' in user ? user.id : undefined);
  
  // Determine online status: use override if provided, otherwise check store
  const isOnline = isOnlineOverride ?? (checkUserId ? isUserOnline(checkUserId) : false);

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            indicatorSizes[size],
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
