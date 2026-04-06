import { AdminPatchEditPage } from '@/components/admin/pages/patch-updates/PatchEditPage';

interface EditPatchUpdatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPatchUpdatePage({ params }: EditPatchUpdatePageProps) {
  const { id } = await params;
  const patchUpdateId = parseInt(id);
  
  return <AdminPatchEditPage patchUpdateId={patchUpdateId} />;
}
