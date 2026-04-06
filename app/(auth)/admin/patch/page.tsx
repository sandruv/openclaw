import { Metadata } from 'next';
import { AdminPatchUpdatesList } from '@/components/admin/pages/patch-updates/PatchUpdatesList';

export const metadata: Metadata = {
  title: 'Admin - Patch Updates | YW Portal',
  description: 'Manage system patch updates and announcements',
};

export default function AdminPatchUpdatesPage() {
  return (
    <AdminPatchUpdatesList className="h-full" />
  );
}
