import { Home, Sparkles, PencilRuler } from "lucide-react"
import { SidebarLink } from "../components"

interface NavigationLinksProps {
  pathname: string
  isCollapsed: boolean
}

export const NavigationLinks = ({ pathname, isCollapsed }: NavigationLinksProps) => {
  const navLinks = [
    { href: "/dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { href: "/assistant", icon: <Sparkles className="h-5 w-5" />, label: "Assistant" },
  ]

  return (
    <div className="px-4 py-2 pr-0">
      {navLinks.map((link) => (
        <SidebarLink
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          isActive={pathname === link.href}
          isCollapsed={isCollapsed}
        />
      ))}
    </div>
  )
}
