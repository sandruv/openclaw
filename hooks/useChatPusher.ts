'use client';

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { useChatStore, OnlineUser } from '@/stores/useChatStore';
import { ChatMessageEvent, ChatTypingEvent, ChatNewConversationEvent } from '@/types/chat';
import { Channel, PresenceChannel, Members } from 'pusher-js';

// Main channel for all conversations updates
const CONVERSATIONS_CHANNEL = 'private-chat-conversations';

// Presence channel for online status
const PRESENCE_CHANNEL = 'presence-chat';

// Member info from Pusher presence channel
interface PusherMember {
  id: string;
  info: {
    name: string;
    email?: string;
    roleId?: number;
  };
}

/**
 * Hook to manage Pusher subscriptions for chat
 * Subscribes to:
 * 1. Presence channel for online status
 * 2. Main conversations channel for new conversations and messages
 * 3. Individual conversation channels for typing indicators
 */
export function useChatPusher() {
  const presenceChannelRef = useRef<PresenceChannel | null>(null);
  const mainChannelRef = useRef<Channel | null>(null);
  const conversationChannelsRef = useRef<Map<number, Channel>>(new Map());
  
  const {
    receiveMessage,
    receiveNewConversation,
    handleTypingEvent,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    conversations,
    currentUserId,
    isInitialized,
  } = useChatStore();

  // Subscribe to presence channel for online status
  useEffect(() => {
    if (!isInitialized || !currentUserId) return;
    if (presenceChannelRef.current) return;

    try {
      console.log(`[Chat] Subscribing to ${PRESENCE_CHANNEL}...`);
      const channel = pusherClient.subscribe(PRESENCE_CHANNEL) as PresenceChannel;

      channel.bind('pusher:subscription_succeeded', (members: Members) => {
        console.log(`[Chat] Subscribed to ${PRESENCE_CHANNEL}, members:`, members.count);
        
        const onlineUsers: OnlineUser[] = [];
        members.each((member: PusherMember) => {
          if (member.id !== currentUserId.toString()) {
            onlineUsers.push({
              id: parseInt(member.id),
              name: member.info.name,
              email: member.info.email,
              roleId: member.info.roleId,
            });
          }
        });
        
        setOnlineUsers(onlineUsers);
      });

      channel.bind('pusher:member_added', (member: PusherMember) => {
        if (member.id !== currentUserId.toString()) {
          addOnlineUser({
            id: parseInt(member.id),
            name: member.info.name,
            email: member.info.email,
            roleId: member.info.roleId,
          });
        }
      });

      channel.bind('pusher:member_removed', (member: PusherMember) => {
        removeOnlineUser(parseInt(member.id));
      });

      channel.bind('pusher:subscription_error', (error: Error) => {
        console.error(`[Chat] Presence subscription error:`, error);
      });

      presenceChannelRef.current = channel;
    } catch (error) {
      console.error(`[Chat] Failed to subscribe to presence:`, error);
    }

    return () => {
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unbind_all();
        pusherClient.unsubscribe(PRESENCE_CHANNEL);
        presenceChannelRef.current = null;
        console.log(`[Chat] Unsubscribed from ${PRESENCE_CHANNEL}`);
      }
    };
  }, [isInitialized, currentUserId, setOnlineUsers, addOnlineUser, removeOnlineUser]);

  // Subscribe to main conversations channel
  useEffect(() => {
    if (!isInitialized || !currentUserId) return;
    if (mainChannelRef.current) return;

    try {
      console.log(`[Chat] Subscribing to ${CONVERSATIONS_CHANNEL}...`);
      const channel = pusherClient.subscribe(CONVERSATIONS_CHANNEL);

      channel.bind('pusher:subscription_succeeded', () => {
        console.log(`[Chat] Subscribed to ${CONVERSATIONS_CHANNEL}`);
      });

      // Handle new messages broadcast to all users
      channel.bind('new-message', (data: ChatMessageEvent) => {
        const state = useChatStore.getState();
        console.log('[Chat] Received new-message event:', data);
        
        if (!data.conversationId || !data.message) {
          console.warn('[Chat] Invalid message data');
          return;
        }
        
        state.receiveMessage(data);
      });

      // Handle new conversations (for agents)
      channel.bind('new-conversation', (data: ChatNewConversationEvent) => {
        const state = useChatStore.getState();
        console.log('[Chat] Received new-conversation event:', data);
        
        if (state.isAgent && data.conversation) {
          state.receiveNewConversation(data);
        }
      });

      channel.bind('pusher:subscription_error', (error: Error) => {
        console.error(`[Chat] Subscription error:`, error);
      });

      mainChannelRef.current = channel;
    } catch (error) {
      console.error(`[Chat] Failed to subscribe:`, error);
    }

    return () => {
      if (mainChannelRef.current) {
        mainChannelRef.current.unbind_all();
        pusherClient.unsubscribe(CONVERSATIONS_CHANNEL);
        mainChannelRef.current = null;
        console.log(`[Chat] Unsubscribed from ${CONVERSATIONS_CHANNEL}`);
      }
    };
  }, [isInitialized, currentUserId]);

  // Subscribe to individual conversation channels for typing indicators
  useEffect(() => {
    if (!isInitialized || !currentUserId) return;

    const currentChannels = conversationChannelsRef.current;
    const conversationIds = new Set(conversations.map(c => c.id));

    // Subscribe to new conversations
    conversations.forEach(conv => {
      if (!currentChannels.has(conv.id)) {
        const channelName = `private-chat-${conv.id}`;
        try {
          const channel = pusherClient.subscribe(channelName);
          
          channel.bind('typing', (data: ChatTypingEvent) => {
            const state = useChatStore.getState();
            state.handleTypingEvent(data);
          });

          // Also listen for new-message on individual channels
          channel.bind('new-message', (data: ChatMessageEvent) => {
            const state = useChatStore.getState();
            state.receiveMessage(data);
          });

          currentChannels.set(conv.id, channel);
          console.log(`[Chat] Subscribed to ${channelName}`);
        } catch (error) {
          console.error(`[Chat] Failed to subscribe to ${channelName}:`, error);
        }
      }
    });

    // Unsubscribe from removed conversations
    currentChannels.forEach((channel, convId) => {
      if (!conversationIds.has(convId)) {
        const channelName = `private-chat-${convId}`;
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
        currentChannels.delete(convId);
        console.log(`[Chat] Unsubscribed from ${channelName}`);
      }
    });

    // Cleanup on unmount
    return () => {
      currentChannels.forEach((channel, convId) => {
        channel.unbind_all();
        pusherClient.unsubscribe(`private-chat-${convId}`);
      });
      currentChannels.clear();
    };
  }, [isInitialized, currentUserId, conversations]);

  return {
    presenceChannel: presenceChannelRef.current,
    mainChannel: mainChannelRef.current,
    conversationChannels: conversationChannelsRef.current,
  };
}

// Export channel names for use in other modules
export { CONVERSATIONS_CHANNEL, PRESENCE_CHANNEL };
