import { PREVIEW_PARAMS } from '@/lib/preview-params'
import UserDetailsPageClient from './UserDetailsPageClient'

interface UserDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  await params
  return <UserDetailsPageClient />
}

export async function generateStaticParams() {
  return [{ id: PREVIEW_PARAMS.id }];
}
