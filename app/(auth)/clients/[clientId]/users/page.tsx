'use client'

import { useParams } from 'next/navigation'
import { ClientUsersTable } from '@/components/clients/clients-tab/details/ClientUsersTable'
import { notFound } from 'next/navigation'

export default function UsersPage() {
  const params = useParams()
  
  if (!params?.clientId) {
    notFound()
  }

  // If we get here, we know clientId exists and is a string
  const clientId = Array.isArray(params.clientId) ? params.clientId[0] : params.clientId

  return <ClientUsersTable clientId={clientId} />
}