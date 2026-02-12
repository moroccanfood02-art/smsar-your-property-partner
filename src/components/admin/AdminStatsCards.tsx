import { Card, CardContent } from '@/components/ui/card';
import {
  Building2, Users, Eye, TrendingUp, DollarSign,
  CreditCard, CheckCircle, Megaphone, MessageSquare, Activity,
} from 'lucide-react';

interface Stats {
  totalProperties: number;
  totalUsers: number;
  totalMessages: number;
  totalViews: number;
  totalTransactions: number;
  totalCommission: number;
  paidCommission: number;
  unpaidCommission: number;
  activePromotions: number;
}

interface AdminStatsCardsProps {
  stats: Stats;
  text: Record<string, string>;
  formatPrice: (price: number, currency?: string) => string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  iconClass: string;
  bgClass: string;
  trend?: string;
}) => (
  <Card className="group hover:shadow-lg transition-all duration-300 border-none bg-card overflow-hidden relative">
    <div className={`absolute inset-0 opacity-[0.03] ${bgClass}`} />
    <CardContent className="p-5 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Activity className="h-3 w-3" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminStatsCards = ({ stats, text, formatPrice }: AdminStatsCardsProps) => {
  const cards = [
    {
      icon: Building2,
      label: text.totalProperties,
      value: stats.totalProperties,
      iconClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: text.totalUsers,
      value: stats.totalUsers,
      iconClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-violet-500/10',
    },
    {
      icon: Eye,
      label: text.totalViews,
      value: stats.totalViews.toLocaleString(),
      iconClass: 'text-cyan-600 dark:text-cyan-400',
      bgClass: 'bg-cyan-500/10',
    },
    {
      icon: MessageSquare,
      label: text.totalMessages,
      value: stats.totalMessages,
      iconClass: 'text-teal-600 dark:text-teal-400',
      bgClass: 'bg-teal-500/10',
    },
    {
      icon: TrendingUp,
      label: text.totalTransactions,
      value: stats.totalTransactions,
      iconClass: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-500/10',
    },
    {
      icon: DollarSign,
      label: text.totalCommission,
      value: formatPrice(stats.totalCommission),
      iconClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-500/10',
    },
    {
      icon: CheckCircle,
      label: text.paidCommission,
      value: formatPrice(stats.paidCommission),
      iconClass: 'text-green-600 dark:text-green-400',
      bgClass: 'bg-green-500/10',
    },
    {
      icon: CreditCard,
      label: text.unpaidCommission,
      value: formatPrice(stats.unpaidCommission),
      iconClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-500/10',
    },
    {
      icon: Megaphone,
      label: text.activePromotions,
      value: stats.activePromotions,
      iconClass: 'text-pink-600 dark:text-pink-400',
      bgClass: 'bg-pink-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
};

export default AdminStatsCards;
