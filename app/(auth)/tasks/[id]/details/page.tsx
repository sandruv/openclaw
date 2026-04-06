import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { TaskDetails } from '@/components/task-details/details'

interface DetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function DetailsPage({ params }: DetailsPageProps) {
  await params
  return <TaskDetails />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
