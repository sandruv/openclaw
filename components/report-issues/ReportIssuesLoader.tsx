import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReportIssuesLoader() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        {/* Page Title Skeleton */}
        <div className="text-center mb-6">
          <Skeleton className="h-9 w-48 mx-auto" />
        </div>
        
        <Card>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Field Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Description Field Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="border rounded-md p-3 space-y-3">
                  {/* Editor Toolbar Skeleton */}
                  <div className="flex gap-1 border-b pb-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-8" />
                    ))}
                  </div>
                  {/* Editor Content Skeleton */}
                  <div className="min-h-[200px] space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
