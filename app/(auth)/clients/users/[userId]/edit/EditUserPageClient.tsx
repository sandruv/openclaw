'use client'

import { UsersUpdate } from "@/components/clients/users-tab/update"

interface EditUserPageClientProps {
  userId: string
}

export default function EditUserPageClient({ userId }: EditUserPageClientProps) {
  return (
    <main className="min-h-screen bg-background">
      <UsersUpdate userId={parseInt(userId, 10)} />
    </main>
  )
}
