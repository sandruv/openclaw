import { PREVIEW_PARAMS } from '@/lib/preview-params'
import TasksNewDetailPageClient from './TasksNewDetailPageClient'

interface TasksNewDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TasksNewDetailPage({ params }: TasksNewDetailPageProps) {
  const { id } = await params
  return <TasksNewDetailPageClient taskId={id} />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
