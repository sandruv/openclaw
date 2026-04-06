import { cn } from "@/lib/utils";

export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-1", className)}>
      <span className="animate-bounce display-inline-block" style={{ animationDelay: '0ms' }}>.</span>
      <span className="animate-bounce display-inline-block" style={{ animationDelay: '150ms' }}>.</span>
      <span className="animate-bounce display-inline-block" style={{ animationDelay: '300ms' }}>.</span>
    </span>
  );
}
