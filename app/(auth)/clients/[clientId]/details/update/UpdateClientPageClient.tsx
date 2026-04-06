'use client'

import { useClientStore } from "@/stores/useClientStore"
import { useEffect, useState } from "react"
import { UpdateClientForm } from "@/components/clients/clients-tab/update"
import { Client } from "@/types/clients"

interface UpdateClientPageClientProps {
  clientId: string
}

export default function UpdateClientPageClient({ clientId }: UpdateClientPageClientProps) {
  const { client: initialClient } = useClientStore()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    if (clientId) {
      setClient(initialClient)
    }
  }, [clientId, initialClient])

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="container-fluid">
      <UpdateClientForm client={client} />
    </div>
  )
}
