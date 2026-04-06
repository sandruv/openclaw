import { PREVIEW_PARAMS } from '@/lib/preview-params'
import UpdateClientPageClient from './UpdateClientPageClient'

interface UpdateClientPageProps {
  params: Promise<{ clientId: string }>
}

export default async function UpdateClientPage({ params }: UpdateClientPageProps) {
  const { clientId } = await params
  return <UpdateClientPageClient clientId={clientId} />
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
