import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Phone, Building2 } from "lucide-react"
import { formatDate } from "@/lib/dateTimeFormat"
import { Site } from "@/types/clients"
import { Badge } from "@/components/ui/badge"
import { CLIENT_STATUS_COLORS } from "@/constants/colors"

interface SiteTableProps {
  sites: Site[]
  onRowClick: (site: Site) => void
}

export function SiteTable({ sites, onRowClick }: SiteTableProps) {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-5">Site</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No sites found
            </TableCell>
          </TableRow>
        ) : sites.map((site) => (
          <TableRow 
            key={site.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onRowClick(site)}
          >
            <TableCell className="pl-5">
              <div>
                <div className="font-medium">{site.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {site.address || '-'}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {site.phone_number || '-'}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {site.client?.name || '-'}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${CLIENT_STATUS_COLORS[site.status || 'active']} font-medium text-white`}>
                {site.status || 'active'}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(site.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
