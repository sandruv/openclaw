import { ChatPage } from '@/components/chat/page';

export const metadata = {
  title: 'Chat | YW Portal',
  description: 'Real-time chat with clients',
};

export default function Chat() {
  return (
    <div className="h-[calc(100vh-64px)]">
      <ChatPage />
    </div>
  );
}
