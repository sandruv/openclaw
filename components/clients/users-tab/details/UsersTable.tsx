import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User } from "@/types/clients"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import { formatDate } from "@/lib/dateTimeFormat"
import { getTechAptitudeIcon, getRoleBadgeColor } from "@/lib/clientUsersUtils"
import { VipIndicator } from "@/components/custom/vip-indicator"
import { TableSkeleton } from "./loaders/TableSkeleton"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"

interface UsersTableProps {
  users: User[]
  isLoading: boolean
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()

  if (isLoading && users.length === 0) {
    return <TableSkeleton />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-5">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Tech Aptitude</TableHead>
          <TableHead>Registered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No users found
            </TableCell>
          </TableRow>
        ) : users.map((user) => (
          <TableRow 
            key={'users-table-' + user.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => { setIsLoading(true); router.push(`/user/${user.id}/details`) }}
          >
            <TableCell className="pl-5">
              {user.first_name || user.last_name ?
                user.first_name+" "+user.last_name : "-"} 

              {user.is_user_vip && <VipIndicator className="ml-2" />}
            </TableCell>
            
            <TableCell>{user.email || '-'}</TableCell>
            <TableCell>
              <Badge className={`${getRoleBadgeColor(user.role.name).bg} ${getRoleBadgeColor(user.role.name).text} font-medium hover:bg-muted/50`}>
                {user.role.name || '-'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                {user.client.name || '-'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-5 w-6 rounded-sm ${getTechAptitudeIcon(user.sophistication.id).color} flex items-center justify-center`}>
                  {getTechAptitudeIcon(user.sophistication.id).icon}
                </div>
                {user.sophistication.name || '-'}
              </div>
            </TableCell>
            <TableCell>{formatDate(user.created_at) || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
