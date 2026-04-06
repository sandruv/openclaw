import { PREVIEW_PARAMS } from '@/lib/preview-params'
interface TaskPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskPage({ params }: TaskPageProps) {
  await params
  return null
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
