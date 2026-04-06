'use client'

import { NewClientHeader } from "@/components/clients/clients-tab/new/NewClientHeader"
import { NewClientForm } from "@/components/clients/clients-tab/new/form"

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <NewClientHeader />
      <NewClientForm />
    </div>
  )
}