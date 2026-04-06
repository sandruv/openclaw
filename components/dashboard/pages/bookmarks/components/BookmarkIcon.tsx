import Image from 'next/image'
import { Link } from 'lucide-react'

export const BookmarkIcon = ({ icon, className = "h-4 w-4" }: { icon?: string | null, className?: string }) => {
  if (icon) {
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return <Image src={icon} alt="" width={16} height={16} className={className} />
    }
    return <span className="text-sm">{icon}</span>
  }
  return <Link className={`${className} text-gray-500 dark:text-gray-400`} />
}
