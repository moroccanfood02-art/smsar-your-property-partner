import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  role: string;
}

interface AdminUsersTabProps {
  users: UserData[];
  text: Record<string, string>;
  formatDate: (date: string) => string;
  getRoleLabel: (role: string) => string;
}

const AdminUsersTab = ({ users, text, formatDate, getRoleLabel }: AdminUsersTabProps) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.role.includes(search)
  );

  const roleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'destructive' as const;
    if (role === 'owner') return 'default' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={text.name + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {filtered.length}
        </Badge>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>{text.name}</TableHead>
                <TableHead>{text.phone}</TableHead>
                <TableHead>{text.role}</TableHead>
                <TableHead>{text.date}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((userData) => (
                <TableRow key={userData.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{userData.full_name}</TableCell>
                  <TableCell className="font-mono text-sm">{userData.phone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(userData.role)}>
                      {getRoleLabel(userData.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(userData.created_at)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">—</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersTab;
