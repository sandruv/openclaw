'use client'

import { useEffect } from 'react'
import { UsersTab } from '@/components/clients/users-tab'
import { useUserStore } from '@/stores/useUserStore'

export default function UsersPage() {
  const { fetchUsers } = useUserStore()

  useEffect(() => {
    fetchUsers()
    // Note: fetchClients() is already called in the clients layout (CLayout)
    // No need to call it again here to avoid duplicate API requests
  }, [fetchUsers])

  return <UsersTab />
}
