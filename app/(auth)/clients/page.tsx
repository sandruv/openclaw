'use client'

import { useClientStore } from '@/stores/useClientStore'
import { ClientsTab } from '@/components/clients/clients-tab'
import { TableSkeleton } from '@/components/clients/clients-tab/subcomponents/TableSkeleton'

export default function ClientsPage() {
  const { isInitialLoading: clientsLoading } = useClientStore()

  // Note: fetchClients() is already called in the clients layout (CLayout)
  // No need to call it again here to avoid duplicate API requests

  if (clientsLoading) {
    return <TableSkeleton />
  }

  return <ClientsTab />
}