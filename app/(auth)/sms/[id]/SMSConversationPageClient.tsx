'use client'

import { SMSPage } from "@/components/sms/sms-page/"

interface SMSConversationPageClientProps {
  id: string
}

export default function SMSConversationPageClient({ id }: SMSConversationPageClientProps) {
  return <SMSPage id={id} />
}
