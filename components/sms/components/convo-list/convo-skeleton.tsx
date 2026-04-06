import { Skeleton } from "@/components/ui/skeleton"

export function ConvoSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[40px]" />
        </div>
        <Skeleton className="h-3 w-[200px]" />
      </div>
    </div>
  )
}
