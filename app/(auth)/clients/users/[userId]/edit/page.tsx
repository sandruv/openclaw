import { PREVIEW_PARAMS } from '@/lib/preview-params'
import EditUserPageClient from './EditUserPageClient'

interface EditUserPageProps {
  params: Promise<{ userId: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = await params
  return <EditUserPageClient userId={userId} />
}

export async function generateStaticParams() {
  return [{ userId: PREVIEW_PARAMS.userId }];
}
