import SLayout from '@/components/settings/index'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SLayout>
      {children}
    </SLayout>
  )
}
