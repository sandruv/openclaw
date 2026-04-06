import { Suspense } from 'react'
import { BookmarksPage } from '@/components/dashboard/pages/bookmarks'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Bookmarks',
  description: 'Manage your bookmarks and quick links',
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    }>
      <BookmarksPage />
    </Suspense>
  )
}
