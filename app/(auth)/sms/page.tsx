'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSmsStore } from '@/stores/useSmsStore';

export default function SmsPage() {
  const router = useRouter();
  const conversations = useSmsStore((state) => state.conversations);

  useEffect(() => {
    if (conversations && conversations.length > 0) {
      const firstConversationId = conversations[0].id;
      router.replace(`/sms/${firstConversationId}`);
    }
  }, [conversations, router]);

  return null; // No need to render anything as we're redirecting
}