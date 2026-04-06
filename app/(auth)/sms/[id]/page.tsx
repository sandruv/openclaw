"use client";
import { SMSPage } from "@/components/sms/sms-page/";
import { useParams } from 'next/navigation';

export default function SMSConversationPage() {
  const params = useParams(); // Get params object
  const id = params?.id as string; // Use optional chaining and type assertion

  return <SMSPage id={id} />;
}
