import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { ClientTasksTable } from '@/components/clients/clients-tab/details/ClientTasksTable'

interface TasksPageProps {
  params: Promise<{ clientId: string }>
}

export default async function TasksPage({ params }: TasksPageProps) {
  const { clientId } = await params
  return <ClientTasksTable clientId={clientId} />
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
