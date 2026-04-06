'use client'

import { useParams, notFound } from 'next/navigation'
import { UserTasksTab } from '@/components/clients/users-tab/details/UserTasksTab'

export default function UserTasksPage() {
  const params = useParams()
  
  if (!params?.id) {
    notFound()
  }

  const userId = Array.isArray(params.id) ? params.id[0] : params.id
  return <UserTasksTab userId={Number(userId)} />
}
