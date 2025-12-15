import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Users,
  MessageSquare,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  CreditCard,
  CheckCircle,
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
}

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  role: string;
}

interface PropertyData {
  id: string;
  title: string;
  city: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  owner_name: string;
}

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

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    totalUsers: 0,
    totalMessages: 0,
    totalViews: 0,
    totalTransactions: 0,
    totalCommission: 0,
    paidCommission: 0,
    unpaidCommission: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'لوحة تحكم المدير',
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      properties: 'العقارات',
      transactions: 'المعاملات',
      totalProperties: 'إجمالي العقارات',
      totalUsers: 'إجمالي المستخدمين',
      totalMessages: 'إجمالي الرسائل',
      totalViews: 'إجمالي المشاهدات',
      totalTransactions: 'إجمالي المعاملات',
      totalCommission: 'إجمالي العمولات',
      paidCommission: 'العمولات المدفوعة',
      unpaidCommission: 'العمولات المستحقة',
      name: 'الاسم',
      phone: 'الهاتف',
      role: 'الدور',
      date: 'التاريخ',
      actions: 'الإجراءات',
      city: 'المدينة',
      price: 'السعر',
      status: 'الحالة',
      owner: 'المالك',
      delete: 'حذف',
      markPaid: 'تحديد كمدفوع',
      customer: 'زبون',
      ownerRole: 'مالك',
      admin: 'مدير',
      available: 'متاح',
      sold: 'مباع',
      rented: 'مؤجر',
      noAccess: 'ليس لديك صلاحية الوصول',
      deleteSuccess: 'تم الحذف بنجاح',
      deleteError: 'حدث خطأ أثناء الحذف',
      transactionType: 'نوع المعاملة',
      amount: 'المبلغ',
      commission: 'العمولة',
      paid: 'مدفوع',
      unpaid: 'غير مدفوع',
      daily_rent: 'كراء يومي',
      monthly_rent: 'كراء شهري',
      permanent_rent: 'كراء دائم',
      sale: 'بيع',
      markedPaid: 'تم تحديد العمولة كمدفوعة',
    },
    fr: {
      title: 'Tableau de Bord Admin',
      overview: 'Aperçu',
      users: 'Utilisateurs',
      properties: 'Propriétés',
      transactions: 'Transactions',
      totalProperties: 'Total Propriétés',
      totalUsers: 'Total Utilisateurs',
      totalMessages: 'Total Messages',
      totalViews: 'Total Vues',
      totalTransactions: 'Total Transactions',
      totalCommission: 'Total Commissions',
      paidCommission: 'Commissions Payées',
      unpaidCommission: 'Commissions Dues',
      name: 'Nom',
      phone: 'Téléphone',
      role: 'Rôle',
      date: 'Date',
      actions: 'Actions',
      city: 'Ville',
      price: 'Prix',
      status: 'Statut',
      owner: 'Propriétaire',
      delete: 'Supprimer',
      markPaid: 'Marquer Payé',
      customer: 'Client',
      ownerRole: 'Propriétaire',
      admin: 'Admin',
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
      noAccess: "Vous n'avez pas accès",
      deleteSuccess: 'Supprimé avec succès',
      deleteError: 'Erreur lors de la suppression',
      transactionType: 'Type',
      amount: 'Montant',
      commission: 'Commission',
      paid: 'Payé',
      unpaid: 'Non Payé',
      daily_rent: 'Location Journalière',
      monthly_rent: 'Location Mensuelle',
      permanent_rent: 'Location Permanente',
      sale: 'Vente',
      markedPaid: 'Commission marquée comme payée',
    },
    en: {
      title: 'Admin Dashboard',
      overview: 'Overview',
      users: 'Users',
      properties: 'Properties',
      transactions: 'Transactions',
      totalProperties: 'Total Properties',
      totalUsers: 'Total Users',
      totalMessages: 'Total Messages',
      totalViews: 'Total Views',
      totalTransactions: 'Total Transactions',
      totalCommission: 'Total Commission',
      paidCommission: 'Paid Commission',
      unpaidCommission: 'Unpaid Commission',
      name: 'Name',
      phone: 'Phone',
      role: 'Role',
      date: 'Date',
      actions: 'Actions',
      city: 'City',
      price: 'Price',
      status: 'Status',
      owner: 'Owner',
      delete: 'Delete',
      markPaid: 'Mark Paid',
      customer: 'Customer',
      ownerRole: 'Owner',
      admin: 'Admin',
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
      noAccess: "You don't have access",
      deleteSuccess: 'Deleted successfully',
      deleteError: 'Error deleting',
      transactionType: 'Type',
      amount: 'Amount',
      commission: 'Commission',
      paid: 'Paid',
      unpaid: 'Unpaid',
      daily_rent: 'Daily Rent',
      monthly_rent: 'Monthly Rent',
      permanent_rent: 'Permanent Rent',
      sale: 'Sale',
      markedPaid: 'Commission marked as paid',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (role !== 'admin') {
        navigate('/');
        toast({
          title: text.noAccess,
          variant: 'destructive',
        });
      }
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchData();
    }
  }, [user, role]);

  const fetchData = async () => {
    // Fetch stats
    const [propertiesRes, usersRes, messagesRes, transactionsRes] = await Promise.all([
      supabase.from('properties').select('id, views_count'),
      supabase.from('profiles').select('id'),
      supabase.from('messages').select('id'),
      supabase.from('transactions').select('*'),
    ]);

    const totalViews = (propertiesRes.data || []).reduce(
      (sum, p) => sum + (p.views_count || 0),
      0
    );

    const transactionsData = transactionsRes.data || [];
    const totalCommission = transactionsData.reduce((sum: number, tx: any) => sum + (tx.commission_amount || 0), 0);
    const paidCommission = transactionsData
      .filter((tx: any) => tx.commission_paid)
      .reduce((sum: number, tx: any) => sum + (tx.commission_amount || 0), 0);
    const unpaidCommission = totalCommission - paidCommission;

    setStats({
      totalProperties: propertiesRes.data?.length || 0,
      totalUsers: usersRes.data?.length || 0,
      totalMessages: messagesRes.data?.length || 0,
      totalViews,
      totalTransactions: transactionsData.length,
      totalCommission,
      paidCommission,
      unpaidCommission,
    });

    // Fetch users with roles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    const usersWithRoles: UserData[] = [];
    for (const profile of profilesData || []) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      usersWithRoles.push({
        ...profile,
        role: roleData?.role || 'customer',
      });
    }
    setUsers(usersWithRoles);

    // Fetch properties with owner names
    const { data: propertiesData } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    const propertiesWithOwners: PropertyData[] = [];
    for (const property of propertiesData || []) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', property.owner_id)
        .maybeSingle();

      propertiesWithOwners.push({
        id: property.id,
        title: property.title,
        city: property.city,
        price: property.price,
        currency: property.currency,
        status: property.status,
        created_at: property.created_at,
        owner_name: ownerProfile?.full_name || 'مجهول',
      });
    }
    setProperties(propertiesWithOwners);

    // Fetch transactions with owner names
    const enrichedTransactions: TransactionData[] = [];
    for (const tx of transactionsData) {
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', tx.owner_id)
        .maybeSingle();

      let propertyTitle = null;
      if (tx.property_id) {
        const { data: property } = await supabase
          .from('properties')
          .select('title')
          .eq('id', tx.property_id)
          .maybeSingle();
        propertyTitle = property?.title;
      }

      enrichedTransactions.push({
        id: tx.id,
        transaction_type: tx.transaction_type,
        transaction_amount: tx.transaction_amount,
        commission_amount: tx.commission_amount,
        commission_paid: tx.commission_paid,
        created_at: tx.created_at,
        owner_name: ownerProfile?.full_name || 'مجهول',
        property_title: propertyTitle,
      });
    }
    setTransactions(enrichedTransactions);

    setLoading(false);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', propertyId);

    if (error) {
      toast({ title: text.deleteError, variant: 'destructive' });
    } else {
      toast({ title: text.deleteSuccess });
      setProperties(properties.filter((p) => p.id !== propertyId));
      setStats((prev) => ({ ...prev, totalProperties: prev.totalProperties - 1 }));
    }
  };

  const handleMarkPaid = async (transactionId: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ commission_paid: true, paid_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (!error) {
      toast({ title: text.markedPaid });
      fetchData();
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-MA').format(price) + ' ' + currency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-MA' : 'fr-MA'
    );
  };

  const getRoleLabel = (userRole: string) => {
    const labels: Record<string, string> = {
      customer: text.customer,
      owner: text.ownerRole,
      admin: text.admin,
    };
    return labels[userRole] || userRole;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: text.available,
      sold: text.sold,
      rented: text.rented,
    };
    return labels[status] || status;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily_rent: text.daily_rent,
      monthly_rent: text.monthly_rent,
      permanent_rent: text.permanent_rent,
      sale: text.sale,
    };
    return labels[type] || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold text-foreground mb-8">{text.title}</h1>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
            <TabsTrigger value="transactions">{text.transactions}</TabsTrigger>
            <TabsTrigger value="users">{text.users}</TabsTrigger>
            <TabsTrigger value="properties">{text.properties}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.totalProperties}
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalProperties}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.totalUsers}
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.totalTransactions}
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalTransactions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.totalViews}
                  </CardTitle>
                  <Eye className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.totalViews}</div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.totalCommission}
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{formatPrice(stats.totalCommission)}</div>
                </CardContent>
              </Card>

              <Card className="border-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.paidCommission}
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{formatPrice(stats.paidCommission)}</div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {text.unpaidCommission}
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{formatPrice(stats.unpaidCommission)}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <span className="font-medium">{tx.owner_name}</span>
                          {tx.property_title && (
                            <p className="text-xs text-muted-foreground">{tx.property_title}</p>
                          )}
                        </TableCell>
                        <TableCell>{getTransactionTypeLabel(tx.transaction_type)}</TableCell>
                        <TableCell>{formatPrice(tx.transaction_amount)}</TableCell>
                        <TableCell className="text-primary font-bold">{formatPrice(tx.commission_amount)}</TableCell>
                        <TableCell>
                          <Badge variant={tx.commission_paid ? 'default' : 'destructive'}>
                            {tx.commission_paid ? text.paid : text.unpaid}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(tx.created_at)}</TableCell>
                        <TableCell>
                          {!tx.commission_paid && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(tx.id)}
                            >
                              <CheckCircle className="h-4 w-4 me-1" />
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
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{text.name}</TableHead>
                      <TableHead>{text.phone}</TableHead>
                      <TableHead>{text.role}</TableHead>
                      <TableHead>{text.date}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell className="font-medium">{userData.full_name}</TableCell>
                        <TableCell>{userData.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getRoleLabel(userData.role)}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(userData.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.title}</TableCell>
                        <TableCell>{property.city}</TableCell>
                        <TableCell>{formatPrice(property.price, property.currency)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getStatusLabel(property.status)}</Badge>
                        </TableCell>
                        <TableCell>{property.owner_name}</TableCell>
                        <TableCell>{formatDate(property.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;