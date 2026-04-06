import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { ClientDetailsTab } from "@/components/clients/clients-tab/details/ClientDetailsTab"

export default function ClientDetailsPage() {
  return <ClientDetailsTab />
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
