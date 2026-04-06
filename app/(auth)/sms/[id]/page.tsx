import { PREVIEW_PARAMS } from '@/lib/preview-params'
import SMSConversationPageClient from './SMSConversationPageClient'

interface SMSConversationPageProps {
  params: Promise<{ id: string }>
}

export default async function SMSConversationPage({ params }: SMSConversationPageProps) {
  const { id } = await params
  return <SMSConversationPageClient id={id} />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
