import { Skeleton } from "@/components/ui/skeleton";

interface ToolItemLoaderProps {
  count?: number;
  width?: string;
  height?: string;
}

export function ToolItemLoader({
  count = 3,
  width = "120px",
  height = "120px"
}: ToolItemLoaderProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array(count).fill(0).map((_, index) => (
        <div 
          key={`skeleton-${index}`} 
          className="rounded-lg border border-gray-100 dark:border-gray-800 p-2 flex flex-col items-center justify-center"
          style={{ width, height }}
        >
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}
