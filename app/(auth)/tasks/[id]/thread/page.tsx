import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { MainThread } from '@/components/task-details/thread/MainThread'

interface ActivityPageProps {
  params: Promise<{ id: string }>
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  await params
  return <MainThread />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
