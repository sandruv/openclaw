'use client'

import { useParams } from 'next/navigation'
import { notFound, redirect } from 'next/navigation'
import { ClientDetailsTab } from '@/components/clients/clients-tab/details/ClientDetailsTab'

export default function ClientIdPage() {
    const params = useParams()
    
    if (!params?.clientId) {
      notFound()
    }

    //redirect to details tab
    redirect(`/clients/${params.clientId}/details`)
}
