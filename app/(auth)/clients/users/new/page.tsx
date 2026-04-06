'use client'

import { UsersNew } from "@/components/clients/users-tab/new"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UsersNewPage() {
  return (
    <main className="min-h-screen bg-background">
      <UsersNew />
    </main>
  )
}
