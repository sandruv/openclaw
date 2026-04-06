'use client'

import { UsersUpdate } from "@/components/clients/users-tab/update"
import { use } from "react"

interface EditUserPageProps {
  params: Promise<{ userId: string }>
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = use(params)
  
  return (
    <main className="min-h-screen bg-background">
      <UsersUpdate userId={parseInt(userId, 10)} />
    </main>
  )
}
