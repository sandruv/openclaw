import { PREVIEW_PARAMS } from '@/lib/preview-params'
import KnowledgeBase from '@/components/task-details/knowledgebase'

interface KnowledgeBasePageProps {
  params: Promise<{ id: string }>
}

export default async function KnowledgeBasePage({ params }: KnowledgeBasePageProps) {
  await params
  return <KnowledgeBase />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
