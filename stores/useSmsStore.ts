import { create } from 'zustand';
import { Message, Contact, Conversation } from '@/types/sms';

interface SmsState {
  messages: Message[];
  contact: Contact | undefined;
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  setMessages: (messages: Message[]) => void;
  setContact: (contact: Contact | undefined) => void;
  clearStore: () => void;
}

export const useSmsStore = create<SmsState>((set) => ({
  messages: [],
  contact: undefined,
  conversations: [],
  isLoading: false,
  error: null,
  setMessages: (messages) => set({ messages }),
  setContact: (contact) => set({ contact }),
  clearStore: () => set({ messages: [], contact: undefined, error: null }),
}));