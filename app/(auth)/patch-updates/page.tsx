import { Metadata } from 'next';
import { PatchUpdatesList } from '@/components/patch-updates/PatchUpdatesList';

export const metadata: Metadata = {
  title: 'Patch Updates | YW Portal',
  description: 'Stay up to date with the latest system changes and improvements',
};

export default function PatchUpdatesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PatchUpdatesList showFilters={true} />
    </div>
  );
}
