import { Loader2 as LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Loader({ className, ...props }: LoaderProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <LoaderIcon className="h-4 w-4 animate-spin" />
    </div>
  )
}

export { LoaderIcon as Loader2 }
