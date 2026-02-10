import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2, Eye, MessageSquare, Plus, Pencil, Trash2,
  TrendingUp, Home, DollarSign, Calendar, CreditCard,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';

interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  currency: string;
  status: string;
  listing_type: string;
  views_count: number;
  images: string[];
  created_at: string;
  area: number;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  property_id: string;
  sender_name?: string;
  property_title?: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  transaction_amount: number;
  commission_amount: number;
  commission_paid: boolean;
  created_at: string;
  property_title?: string;
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

const OwnerDashboard = () => {
  const { user, loading: authLoading, role } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalMessages: 0,
    activeListings: 0,
    totalTransactions: 0,
    totalCommissionDue: 0,
    totalEarningsToday: 0,
    totalEarningsMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && role !== 'owner' && role !== 'admin') {
      toast({ title: t('noAccess'), variant: 'destructive' });
      navigate('/');
    }
  }, [user, authLoading, role, navigate]);

  useEffect(() => {
    if (user && (role === 'owner' || role === 'admin')) {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    if (!user) return;

    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (propertiesData) {
      setProperties(propertiesData);
      const totalViews = propertiesData.reduce((sum, p) => sum + (p.views_count || 0), 0);
      const activeListings = propertiesData.filter((p) => p.status === 'available').length;
      setStats((prev) => ({ ...prev, totalViews, activeListings }));
    }

    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (messagesData) {
      const enrichedMessages = await Promise.all(
        messagesData.map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', msg.sender_id)
            .maybeSingle();
          let propertyTitle = null;
          if (msg.property_id) {
            const { data: property } = await supabase
              .from('properties')
              .select('title')
              .eq('id', msg.property_id)
              .maybeSingle();
            propertyTitle = property?.title;
          }
          return { ...msg, sender_name: profile?.full_name || t('customer'), property_title: propertyTitle };
        })
      );
      setMessages(enrichedMessages);
      setStats((prev) => ({ ...prev, totalMessages: messagesData.length }));
    }

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (transactionsData) {
      const enrichedTransactions = await Promise.all(
        transactionsData.map(async (tx: any) => {
          let propertyTitle = null;
          if (tx.property_id) {
            const { data: property } = await supabase
              .from('properties')
              .select('title')
              .eq('id', tx.property_id)
              .maybeSingle();
            propertyTitle = property?.title;
          }
          return { ...tx, property_title: propertyTitle };
        })
      );
      setTransactions(enrichedTransactions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const unpaidCommission = transactionsData
        .filter((tx: any) => !tx.commission_paid)
        .reduce((sum: number, tx: any) => sum + (tx.commission_amount || 0), 0);
      const earningsToday = transactionsData
        .filter((tx: any) => new Date(tx.created_at) >= today)
        .reduce((sum: number, tx: any) => sum + (tx.transaction_amount || 0), 0);
      const earningsMonth = transactionsData
        .filter((tx: any) => new Date(tx.created_at) >= startOfMonth)
        .reduce((sum: number, tx: any) => sum + (tx.transaction_amount || 0), 0);

      setStats((prev) => ({
        ...prev,
        totalTransactions: transactionsData.length,
        totalCommissionDue: unpaidCommission,
        totalEarningsToday: earningsToday,
        totalEarningsMonth: earningsMonth,
      }));
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('properties').delete().eq('id', deleteId);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.id !== deleteId));
      toast({ title: t('propertyDeleted') });
    }
    setDeleteId(null);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: t('available'),
      sold: t('sold'),
      rented: t('rented'),
      unavailable: t('notAvailable'),
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      sold: 'bg-blue-500',
      rented: 'bg-yellow-500',
      unavailable: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getTransactionTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      daily_rent: t('daily_rent'),
      monthly_rent: t('monthly_rent'),
      permanent_rent: t('permanent_rent'),
      sale: t('sale'),
    };
    return map[type] || type;
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-US').format(price) + ' ' + currency;
  };

  // Chart Data
  const statusData = (() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: getStatusLabel(name),
      value,
    }));
  })();

  const monthlyEarningsData = (() => {
    const months: Record<string, number> = {};
    transactions.forEach((tx) => {
      const month = new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en', { month: 'short', year: '2-digit' });
      months[month] = (months[month] || 0) + tx.transaction_amount;
    });
    return Object.entries(months).slice(-6).map(([name, amount]) => ({ name, amount }));
  })();

  const viewsByProperty = properties
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5)
    .map((p) => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
      views: p.views_count || 0,
    }));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('ownerDashboard')}</h1>
          <Button asChild>
            <Link to="/add-property">
              <Plus className="w-4 h-4 me-2" />
              {t('addProperty')}
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
            <TabsTrigger value="properties">{t('properties')}</TabsTrigger>
            <TabsTrigger value="transactions">{t('transactionsTab')}</TabsTrigger>
            <TabsTrigger value="messages">{t('messages')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalViews')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalMessages')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMessages}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('activeListings')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeListings}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">{t('recentMessages')}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/messages">{t('viewAllMessages')}</Link>
                </Button>
              </div>
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('noMessages')}</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{msg.sender_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{msg.content}</p>
                        {msg.property_title && (
                          <p className="text-xs text-primary mt-1">{t('regarding')}: {msg.property_title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalTransactions')}</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalTransactions}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-destructive">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('commissionDue')}</p>
                    <p className="text-2xl font-bold text-destructive">{formatPrice(stats.totalCommissionDue)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('earningsToday')}</p>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalEarningsToday)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('earningsMonth')}</p>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalEarningsMonth)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Properties by Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('propertiesByStatus')}</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {statusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('noProperties')}</p>
                )}
              </Card>

              {/* Views by Property */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('viewsChart')}</h3>
                {viewsByProperty.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={viewsByProperty}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('noProperties')}</p>
                )}
              </Card>

              {/* Monthly Earnings */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">{t('monthlyEarnings')}</h3>
                {monthlyEarningsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyEarningsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">{t('noTransactions')}</p>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            {properties.length === 0 ? (
              <Card className="p-12 text-center">
                <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('noProperties')}</h3>
                <p className="text-muted-foreground mb-6">{t('addFirstProperty')}</p>
                <Button asChild>
                  <Link to="/add-property">
                    <Plus className="w-4 h-4 me-2" />
                    {t('addProperty')}
                  </Link>
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={property.images?.[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-2 end-2 ${getStatusColor(property.status)}`}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{property.city}</p>
                      <p className="text-lg font-bold text-primary mb-3">
                        {formatPrice(property.price, property.currency)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {property.views_count || 0} {t('views')}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/edit-property/${property.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteId(property.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('noTransactions')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-start p-3 text-muted-foreground">{t('transactionType')}</th>
                        <th className="text-start p-3 text-muted-foreground">{t('amount')}</th>
                        <th className="text-start p-3 text-muted-foreground">{t('commission')}</th>
                        <th className="text-start p-3 text-muted-foreground">{t('date')}</th>
                        <th className="text-start p-3 text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b">
                          <td className="p-3">
                            <span className="font-medium">{getTransactionTypeLabel(tx.transaction_type)}</span>
                            {tx.property_title && (
                              <p className="text-xs text-muted-foreground">{tx.property_title}</p>
                            )}
                          </td>
                          <td className="p-3">{formatPrice(tx.transaction_amount)}</td>
                          <td className="p-3 text-destructive">{formatPrice(tx.commission_amount)}</td>
                          <td className="p-3">{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            <Badge variant={tx.commission_paid ? 'default' : 'destructive'}>
                              {tx.commission_paid ? t('paid') : t('unpaid')}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="p-6">
              <Button variant="outline" className="mb-6" asChild>
                <Link to="/messages">{t('viewAllMessages')}</Link>
              </Button>
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('noMessages')}</p>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-foreground">{msg.sender_name}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">{msg.content}</p>
                        {msg.property_title && (
                          <p className="text-xs text-primary mt-2">{t('regarding')}: {msg.property_title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerDashboard;
