import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity, Building2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

interface PromotionData {
  id: string;
  promotion_type: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  is_active: boolean;
}

interface TransactionData {
  id: string;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  commission_paid: boolean;
  created_at: string;
}

interface PropertyData {
  id: string;
  city: string;
  status: string;
}

interface AdminOverviewChartsProps {
  promotions: PromotionData[];
  transactions: TransactionData[];
  properties: PropertyData[];
  text: Record<string, string>;
  language: string;
  formatPrice: (price: number, currency?: string) => string;
}

const CHART_COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#ef4444'];

const AdminOverviewCharts = ({
  promotions,
  transactions,
  properties,
  text,
  language,
  formatPrice,
}: AdminOverviewChartsProps) => {
  // Properties by city
  const cityData = (() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.city] = (counts[p.city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  })();

  // Properties by status
  const statusData = (() => {
    const labels: Record<string, string> = {
      available: text.available || 'Available',
      sold: text.sold || 'Sold',
      rented: text.rented || 'Rented',
    };
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      const label = labels[p.status] || p.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Monthly revenue from promotions
  const monthlyRevenue = (() => {
    const now = new Date();
    const data: { name: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
      const monthNum = date.getMonth();
      const year = date.getFullYear();
      const filtered = promotions.filter((p) => {
        const d = new Date(p.start_date);
        return d.getMonth() === monthNum && d.getFullYear() === year;
      });
      data.push({
        name: monthKey,
        revenue: filtered.reduce((s, p) => s + p.amount_paid, 0),
        count: filtered.length,
      });
    }
    return data;
  })();

  // Commission trend
  const commissionTrend = (() => {
    const now = new Date();
    const data: { name: string; paid: number; unpaid: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
      const monthNum = date.getMonth();
      const year = date.getFullYear();
      const filtered = transactions.filter((t) => {
        const d = new Date(t.created_at);
        return d.getMonth() === monthNum && d.getFullYear() === year;
      });
      data.push({
        name: monthKey,
        paid: filtered.filter((t) => t.commission_paid).reduce((s, t) => s + t.commission_amount, 0),
        unpaid: filtered.filter((t) => !t.commission_paid).reduce((s, t) => s + t.commission_amount, 0),
      });
    }
    return data;
  })();

  // Transaction types
  const transactionTypeData = (() => {
    const labels: Record<string, string> = {
      daily_rent: text.daily_rent || 'Daily Rent',
      monthly_rent: text.monthly_rent || 'Monthly Rent',
      permanent_rent: text.permanent_rent || 'Permanent Rent',
      sale: text.sale || 'Sale',
    };
    const counts: Record<string, number> = {};
    transactions.forEach((t) => {
      const label = labels[t.transaction_type] || t.transaction_type;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  return (
    <div className="space-y-6 mt-6">
      {/* Row 1: Revenue + Commission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              {text.monthlyRevenue || 'Monthly Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-green-500" />
              {language === 'ar' ? 'اتجاه العمولات' : 'Commission Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={commissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name={text.paidCommission || 'Paid'} />
                <Bar dataKey="unpaid" fill="#ef4444" radius={[4, 4, 0, 0]} name={text.unpaidCommission || 'Unpaid'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-4 w-4 text-blue-500" />
              {language === 'ar' ? 'العقارات حسب الحالة' : 'Properties by Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <BarChart3 className="h-4 w-4 text-violet-500" />
              {language === 'ar' ? 'المعاملات حسب النوع' : 'Transactions by Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={transactionTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {transactionTypeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">—</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Building2 className="h-4 w-4 text-teal-500" />
              {language === 'ar' ? 'العقارات حسب المدينة' : 'Properties by City'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" fontSize={11} width={80} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">—</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewCharts;
