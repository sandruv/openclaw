'use client'

import { useParams } from "next/navigation"
import { useClientStore } from "@/stores/useClientStore"
import { useEffect, useState } from "react"
import { UpdateClientForm } from "@/components/clients/clients-tab/update"
import { Client } from "@/types/clients"
import { Loader2 } from "lucide-react"

export default function UpdateClientPage() {
  const params = useParams()
  const { client: initialClient } = useClientStore()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClient = async () => {
      if (params?.clientId) {
        try {
          setClient(initialClient)
        } catch (error) {
          console.error('Error fetching client:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchClient()
  }, [params?.clientId, initialClient])

  if (!client) {
    return <div>Client not found</div>
  }

  return (
    <div className="container-fluid">
      <UpdateClientForm client={client} />
    </div>
  )
}
