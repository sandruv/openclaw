import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { UserTasksTab } from '@/components/clients/users-tab/details/UserTasksTab'

interface UserTasksPageProps {
  params: Promise<{ id: string }>
}

export default async function UserTasksPage({ params }: UserTasksPageProps) {
  const { id } = await params
  return <UserTasksTab userId={Number(id)} />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
