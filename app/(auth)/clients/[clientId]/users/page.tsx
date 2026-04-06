import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { ClientUsersTable } from '@/components/clients/clients-tab/details/ClientUsersTable'

interface UsersPageProps {
  params: Promise<{ clientId: string }>
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { clientId } = await params
  return <ClientUsersTable clientId={clientId} />
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
