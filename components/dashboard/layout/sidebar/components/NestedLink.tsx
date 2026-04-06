import { cn } from "@/lib/utils"

export interface NestedLinkProps {
  href: string
  label: string
}

export const NestedLink = ({ href, label }: NestedLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center rounded-lg rounded-tr-none rounded-br-none px-3 py-1 text-xs transition-all hover:bg-accent text-muted-foreground"
      )}
    >
      <span className="truncate">{label}</span>
    </a>
  )
}
