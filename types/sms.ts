export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutbound: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface Conversation {
  id: string;
  contact: string;
  messages: Message[];
}