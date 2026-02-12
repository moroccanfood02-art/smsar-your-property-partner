import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface TransactionData {
  id: string;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  commission_paid: boolean;
  created_at: string;
  owner_name: string;
  property_title: string | null;
}

interface AdminTransactionsTabProps {
  transactions: TransactionData[];
  text: Record<string, string>;
  formatPrice: (price: number, currency?: string) => string;
  formatDate: (date: string) => string;
  getTransactionTypeLabel: (type: string) => string;
  onMarkPaid: (id: string) => void;
  onExportPDF: () => void;
}

const AdminTransactionsTab = ({
  transactions,
  text,
  formatPrice,
  formatDate,
  getTransactionTypeLabel,
  onMarkPaid,
  onExportPDF,
}: AdminTransactionsTabProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const filtered = transactions
    .filter((tx) => {
      if (filter === 'paid') return tx.commission_paid;
      if (filter === 'unpaid') return !tx.commission_paid;
      return true;
    })
    .filter(
      (tx) =>
        tx.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        tx.property_title?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={text.owner + '...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 w-[200px]"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'paid', 'unpaid'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? (text.transactions || 'All') : f === 'paid' ? text.paid : text.unpaid}
              </Button>
            ))}
          </div>
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
                <TableHead>{text.owner}</TableHead>
                <TableHead>{text.transactionType}</TableHead>
                <TableHead>{text.amount}</TableHead>
                <TableHead>{text.commission}</TableHead>
                <TableHead>{text.status}</TableHead>
                <TableHead>{text.date}</TableHead>
                <TableHead>{text.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <span className="font-medium">{tx.owner_name}</span>
                    {tx.property_title && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{tx.property_title}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTransactionTypeLabel(tx.transaction_type)}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">{formatPrice(tx.transaction_amount)}</TableCell>
                  <TableCell className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatPrice(tx.commission_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.commission_paid ? 'default' : 'destructive'}>
                      {tx.commission_paid ? text.paid : text.unpaid}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(tx.created_at)}</TableCell>
                  <TableCell>
                    {!tx.commission_paid && (
                      <Button variant="outline" size="sm" onClick={() => onMarkPaid(tx.id)} className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {text.markPaid}
                      </Button>
                    )}
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

export default AdminTransactionsTab;
