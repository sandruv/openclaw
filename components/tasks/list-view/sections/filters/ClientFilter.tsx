import { useMemo, useEffect } from "react"
import { ComboboxApi, ComboboxOption } from "@/components/ui/combobox-api"
import { useTasksStore } from "@/stores/useTasksStore"
import { useDropdownStore } from "@/stores/useDropdownStore"

interface ClientFilterProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function ClientFilter({ value, onValueChange, className }: ClientFilterProps) {
  const { tasks } = useTasksStore()
  const { clients, isSearchingClients, fetchClients, searchClients } = useDropdownStore()

  // Generate initial client options from tasks data
  const initialClients = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return []

    const uniqueClients = new Map()
    tasks.forEach(task => {
      if (task.client && task.client.id) {
        uniqueClients.set(task.client.id, {
          value: task.client.id.toString(),
          label: task.client.name
        })
      }
    })

    return Array.from(uniqueClients.values()) as ComboboxOption[]
  }, [tasks])

  // Load initial clients on mount
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients()
    }
  }, [clients.length, fetchClients])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // If no query, fetch all clients
      await fetchClients()
      return
    }

    // Use the store's search method
    await searchClients(query)
  }

  return (
    <ComboboxApi
      options={clients}
      value={value}
      onValueChange={onValueChange}
      onSearch={handleSearch}
      placeholder="By Client"
      emptyMessage="No clients found"
      className={className}
      isSearchLoading={isSearchingClients}
      searchDebounce={300}
    />
  )
}
