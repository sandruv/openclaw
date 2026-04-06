import { ComboboxOption } from "@/components/ui/combobox"
import { Client, User, Site } from "@/types/clients"
import { logger } from '@/lib/logger'

export const clientToOption = (client: Client): ComboboxOption => {
  // clone client
  const cloned_client = { ...client }
  logger.debug('cloned_client', cloned_client)
  return {
    value: cloned_client.id.toString(),
    label: cloned_client.name
  }
}

export const userToOption = (user: User): ComboboxOption => ({
  value: user.id.toString(),
  label: `${user.first_name} ${user.last_name}`
})

export const siteToOption = (site: Site): ComboboxOption => ({
  value: site.id.toString(),
  label: site.name
})

export const toComboboxOptions = <T extends Client | User | Site>(
  items: T[],
  transform: (item: T) => ComboboxOption
): ComboboxOption[] => {
  return items.map(transform)
}
