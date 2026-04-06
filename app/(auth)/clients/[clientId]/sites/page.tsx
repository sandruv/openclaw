'use client'

import { useParams, notFound } from 'next/navigation'
import { ClientSitesTable } from '@/components/clients/clients-tab/details/ClientSitesTable'

export default function SitesPage() {
  const params = useParams()
  
  if (!params?.clientId) {
    notFound()
  }

  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId

  return <ClientSitesTable clientId={clientId} />
}