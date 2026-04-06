import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonInlineProps {
  className?: string
  width?: string | number
  height?: string | number
  children?: React.ReactNode
  isLoading?: boolean
}

export function SkeletonInline({ 
  className, 
  width, 
  height, 
  children, 
  isLoading = false 
}: SkeletonInlineProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <Skeleton 
      className={cn("inline-block", className)} 
      style={style}
    />
  )
}

// Predefined skeleton sizes for common use cases
export const SkeletonText = ({ isLoading, children, className }: { 
  isLoading?: boolean
  children?: React.ReactNode
  className?: string 
}) => (
  <SkeletonInline 
    isLoading={isLoading} 
    width="6rem" 
    height="1rem" 
    className={className}
  >
    {children}
  </SkeletonInline>
)

export const SkeletonBadge = ({ isLoading, children, className }: { 
  isLoading?: boolean
  children?: React.ReactNode
  className?: string 
}) => (
  <SkeletonInline 
    isLoading={isLoading} 
    width="4rem" 
    height="1.5rem" 
    className={cn("rounded-full", className)}
  >
    {children}
  </SkeletonInline>
)

export const SkeletonAvatar = ({ isLoading, children, className }: { 
  isLoading?: boolean
  children?: React.ReactNode
  className?: string 
}) => (
  <SkeletonInline 
    isLoading={isLoading} 
    width="2rem" 
    height="2rem" 
    className={cn("rounded-full", className)}
  >
    {children}
  </SkeletonInline>
)
