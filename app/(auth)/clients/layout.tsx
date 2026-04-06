import CLayout from '@/components/clients/index'
// import { getClients } from '@/services/clientService'

export default async function  ClientsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CLayout>
      {children}
    </CLayout>
  )
}
