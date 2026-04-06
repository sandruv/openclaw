import { PREVIEW_PARAMS } from '@/lib/preview-params'
import { redirect } from 'next/navigation'

interface ClientIdPageProps {
  params: Promise<{ clientId: string }>
}

export default async function ClientIdPage({ params }: ClientIdPageProps) {
  const { clientId } = await params
  redirect(`/clients/${clientId}/details`)
}

export async function generateStaticParams() {
  return [{ clientId: PREVIEW_PARAMS.clientId }];
}
