import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { ClientSitesTable } from '@/components/clients/clients-tab/details/ClientSitesTable'

interface SitesPageProps {
  params: Promise<{ clientId: string }>
}

export default async function SitesPage({ params }: SitesPageProps) {
  const { clientId } = await params
  return <ClientSitesTable clientId={clientId} />
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
