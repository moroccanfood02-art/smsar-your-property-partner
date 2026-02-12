import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, FileText, Search, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PropertyData {
  id: string;
  title: string;
  city: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  owner_name: string;
  owner_id: string;
}

interface AdminPropertiesTabProps {
  properties: PropertyData[];
  text: Record<string, string>;
  formatPrice: (price: number, currency?: string) => string;
  formatDate: (date: string) => string;
  getStatusLabel: (status: string) => string;
  onDelete: (id: string) => void;
  onExportPDF: () => void;
}

const AdminPropertiesTab = ({
  properties,
  text,
  formatPrice,
  formatDate,
  getStatusLabel,
  onDelete,
  onExportPDF,
}: AdminPropertiesTabProps) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    if (status === 'available') return 'default' as const;
    if (status === 'sold') return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={text.name + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileText className="h-4 w-4 me-2" />
          {text.downloadPDF}
        </Button>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{text.name}</TableHead>
                <TableHead>{text.city}</TableHead>
                <TableHead>{text.price}</TableHead>
                <TableHead>{text.status}</TableHead>
                <TableHead>{text.owner}</TableHead>
                <TableHead>{text.date}</TableHead>
                <TableHead>{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((property) => (
                <TableRow key={property.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-[200px] truncate">{property.title}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell className="font-mono">{formatPrice(property.price, property.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(property.status)}>{getStatusLabel(property.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{property.owner_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(property.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(property.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPropertiesTab;
