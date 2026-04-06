'use client'

import { useEffect } from 'react'
import { SitesTab } from '@/components/clients/sites-tab'
import { useSiteStore } from '@/stores/useSiteStore'
import { useClientStore } from '@/stores/useClientStore'

export default function SitesPage() {
  const { fetchSites } = useSiteStore()

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  return <SitesTab />
}
