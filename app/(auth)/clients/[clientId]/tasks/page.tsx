'use client'

import { useParams } from 'next/navigation'
import { ClientTasksTable } from '@/components/clients/clients-tab/details/ClientTasksTable'
import { notFound } from 'next/navigation'

export default function TasksPage() {
  const params = useParams()
  
  if (!params?.clientId) {
    notFound()
  }

  // If we get here, we know clientId exists and is a string
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId
  
  return <ClientTasksTable clientId={clientId} />
}