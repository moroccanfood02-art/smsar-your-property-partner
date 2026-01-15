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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  CreditCard,
  CheckCircle,
  Megaphone,
  Plus,
  Video,
  Image,
  Star,
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
  owner_id: string;
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

interface PromotionData {
  id: string;
  property_id: string;
  property_title: string;
  promotion_type: string;
  video_url: string | null;
  banner_image_url: string | null;
  start_date: string;
  end_date: string;
  amount_paid: number;
  is_active: boolean;
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
    activePromotions: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    property_id: '',
    promotion_type: 'featured',
    video_url: '',
    banner_image_url: '',
    duration_days: 7,
    amount_paid: 50,
  });

  const t = {
    ar: {
      title: 'لوحة تحكم المدير',
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      properties: 'العقارات',
      transactions: 'المعاملات',
      promotions: 'الإعلانات',
      totalProperties: 'إجمالي العقارات',
      totalUsers: 'إجمالي المستخدمين',
      totalMessages: 'إجمالي الرسائل',
      totalViews: 'إجمالي المشاهدات',
      totalTransactions: 'إجمالي المعاملات',
      totalCommission: 'إجمالي العمولات',
      paidCommission: 'العمولات المدفوعة',
      unpaidCommission: 'العمولات المستحقة',
      activePromotions: 'الإعلانات النشطة',
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
      addPromotion: 'إضافة إعلان',
      selectProperty: 'اختر العقار',
      promotionType: 'نوع الإعلان',
      featured: 'مميز',
      video_ad: 'إعلان فيديو',
      banner: 'بانر',
      homepage: 'الصفحة الرئيسية',
      videoUrl: 'رابط الفيديو',
      duration: 'المدة (أيام)',
      amountPaid: 'المبلغ المدفوع',
      create: 'إنشاء',
      promotionCreated: 'تم إنشاء الإعلان بنجاح',
      endDate: 'تاريخ الانتهاء',
      active: 'نشط',
      expired: 'منتهي',
      deactivate: 'إلغاء التفعيل',
      property: 'العقار',
      bannerImage: 'صورة البانر',
      uploadBanner: 'رفع صورة',
      uploadVideo: 'رفع فيديو',
      uploading: 'جاري الرفع...',
      viewBanner: 'عرض البانر',
      viewVideo: 'عرض الفيديو',
    },
    fr: {
      title: 'Tableau de Bord Admin',
      overview: 'Aperçu',
      users: 'Utilisateurs',
      properties: 'Propriétés',
      transactions: 'Transactions',
      promotions: 'Promotions',
      totalProperties: 'Total Propriétés',
      totalUsers: 'Total Utilisateurs',
      totalMessages: 'Total Messages',
      totalViews: 'Total Vues',
      totalTransactions: 'Total Transactions',
      totalCommission: 'Total Commissions',
      paidCommission: 'Commissions Payées',
      unpaidCommission: 'Commissions Dues',
      activePromotions: 'Promotions Actives',
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
      addPromotion: 'Ajouter Promotion',
      selectProperty: 'Sélectionner Propriété',
      promotionType: 'Type de Promotion',
      featured: 'En Vedette',
      video_ad: 'Pub Vidéo',
      banner: 'Bannière',
      homepage: 'Page Accueil',
      videoUrl: 'URL Vidéo',
      duration: 'Durée (jours)',
      amountPaid: 'Montant Payé',
      create: 'Créer',
      promotionCreated: 'Promotion créée avec succès',
      endDate: 'Date Fin',
      active: 'Actif',
      expired: 'Expiré',
      deactivate: 'Désactiver',
      property: 'Propriété',
      bannerImage: 'Image Bannière',
      uploadBanner: 'Télécharger Image',
      uploadVideo: 'Télécharger Vidéo',
      uploading: 'Téléchargement...',
      viewBanner: 'Voir Bannière',
      viewVideo: 'Voir Vidéo',
    },
    en: {
      title: 'Admin Dashboard',
      overview: 'Overview',
      users: 'Users',
      properties: 'Properties',
      transactions: 'Transactions',
      promotions: 'Promotions',
      totalProperties: 'Total Properties',
      totalUsers: 'Total Users',
      totalMessages: 'Total Messages',
      totalViews: 'Total Views',
      totalTransactions: 'Total Transactions',
      totalCommission: 'Total Commission',
      paidCommission: 'Paid Commission',
      unpaidCommission: 'Unpaid Commission',
      activePromotions: 'Active Promotions',
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
      addPromotion: 'Add Promotion',
      selectProperty: 'Select Property',
      promotionType: 'Promotion Type',
      featured: 'Featured',
      video_ad: 'Video Ad',
      banner: 'Banner',
      homepage: 'Homepage',
      videoUrl: 'Video URL',
      duration: 'Duration (days)',
      amountPaid: 'Amount Paid',
      create: 'Create',
      promotionCreated: 'Promotion created successfully',
      endDate: 'End Date',
      active: 'Active',
      expired: 'Expired',
      deactivate: 'Deactivate',
      property: 'Property',
      bannerImage: 'Banner Image',
      uploadBanner: 'Upload Image',
      uploadVideo: 'Upload Video',
      uploading: 'Uploading...',
      viewBanner: 'View Banner',
      viewVideo: 'View Video',
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
    const [propertiesRes, usersRes, messagesRes, transactionsRes, promotionsRes] = await Promise.all([
      supabase.from('properties').select('id, views_count, title, city, price, currency, status, created_at, owner_id'),
      supabase.from('profiles').select('id'),
      supabase.from('messages').select('id'),
      supabase.from('transactions').select('*'),
      supabase.from('property_promotions').select('*').order('created_at', { ascending: false }),
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

    const activePromos = (promotionsRes.data || []).filter(
      (p: any) => p.is_active && new Date(p.end_date) > new Date()
    ).length;

    setStats({
      totalProperties: propertiesRes.data?.length || 0,
      totalUsers: usersRes.data?.length || 0,
      totalMessages: messagesRes.data?.length || 0,
      totalViews,
      totalTransactions: transactionsData.length,
      totalCommission,
      paidCommission,
      unpaidCommission,
      activePromotions: activePromos,
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
    const propertiesWithOwners: PropertyData[] = [];
    for (const property of propertiesRes.data || []) {
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
        owner_id: property.owner_id,
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

    // Fetch promotions with property titles
    const enrichedPromotions: PromotionData[] = [];
    for (const promo of promotionsRes.data || []) {
      const property = propertiesWithOwners.find(p => p.id === promo.property_id);
      enrichedPromotions.push({
        id: promo.id,
        property_id: promo.property_id,
        property_title: property?.title || 'غير معروف',
        promotion_type: promo.promotion_type,
        video_url: promo.video_url,
        banner_image_url: promo.banner_image_url,
        start_date: promo.start_date,
        end_date: promo.end_date,
        amount_paid: promo.amount_paid,
        is_active: promo.is_active && new Date(promo.end_date) > new Date(),
      });
    }
    setPromotions(enrichedPromotions);

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

  const handleCreatePromotion = async () => {
    const property = properties.find(p => p.id === newPromotion.property_id);
    if (!property) return;

    setUploadingMedia(true);
    let videoUrl = newPromotion.video_url || null;
    let bannerUrl = newPromotion.banner_image_url || null;

    try {
      // Upload banner image if provided
      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `${newPromotion.property_id}-banner-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('promotion-media')
          .upload(fileName, bannerFile);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('promotion-media')
            .getPublicUrl(fileName);
          bannerUrl = publicUrl;
        }
      }

      // Upload video file if provided
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${newPromotion.property_id}-video-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('promotion-media')
          .upload(fileName, videoFile);
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('promotion-media')
            .getPublicUrl(fileName);
          videoUrl = publicUrl;
        }
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + newPromotion.duration_days);

      const { error } = await supabase.from('property_promotions').insert({
        property_id: newPromotion.property_id,
        owner_id: property.owner_id,
        promotion_type: newPromotion.promotion_type,
        video_url: videoUrl,
        banner_image_url: bannerUrl,
        end_date: endDate.toISOString(),
        amount_paid: newPromotion.amount_paid,
        is_active: true,
      });

      if (!error) {
        toast({ title: text.promotionCreated });
        setShowPromotionDialog(false);
        setNewPromotion({
          property_id: '',
          promotion_type: 'featured',
          video_url: '',
          banner_image_url: '',
          duration_days: 7,
          amount_paid: 50,
        });
        setBannerFile(null);
        setVideoFile(null);

        // Send notification to owner
        await supabase.from('notifications').insert({
          user_id: property.owner_id,
          title: 'إعلان جديد لعقارك',
          message: `تم تفعيل إعلان لعقارك "${property.title}" لمدة ${newPromotion.duration_days} أيام`,
          type: 'promotion',
          link: '/owner-dashboard',
        });

        fetchData();
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeactivatePromotion = async (promotionId: string) => {
    const { error } = await supabase
      .from('property_promotions')
      .update({ is_active: false })
      .eq('id', promotionId);

    if (!error) {
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

  const getPromotionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      featured: text.featured,
      video_ad: text.video_ad,
      banner: text.banner,
      homepage: text.homepage,
    };
    return labels[type] || type;
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'video_ad':
        return <Video className="h-4 w-4" />;
      case 'banner':
        return <Image className="h-4 w-4" />;
      case 'homepage':
        return <Star className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
            <TabsTrigger value="transactions">{text.transactions}</TabsTrigger>
            <TabsTrigger value="promotions">{text.promotions}</TabsTrigger>
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
                    {text.activePromotions}
                  </CardTitle>
                  <Megaphone className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.activePromotions}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <TabsContent value="promotions">
            <div className="flex justify-end mb-4">
              <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 me-2" />
                    {text.addPromotion}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{text.addPromotion}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>{text.selectProperty}</Label>
                      <Select
                        value={newPromotion.property_id}
                        onValueChange={(value) => setNewPromotion({ ...newPromotion, property_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={text.selectProperty} />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} - {property.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{text.promotionType}</Label>
                      <Select
                        value={newPromotion.promotion_type}
                        onValueChange={(value) => setNewPromotion({ ...newPromotion, promotion_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">{text.featured}</SelectItem>
                          <SelectItem value="video_ad">{text.video_ad}</SelectItem>
                          <SelectItem value="banner">{text.banner}</SelectItem>
                          <SelectItem value="homepage">{text.homepage}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(newPromotion.promotion_type === 'video_ad' || newPromotion.promotion_type === 'homepage') && (
                      <div>
                        <Label>{text.uploadVideo}</Label>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'ar' ? 'أو أدخل رابط الفيديو:' : 'Or enter video URL:'}
                        </p>
                        <Input
                          value={newPromotion.video_url}
                          onChange={(e) => setNewPromotion({ ...newPromotion, video_url: e.target.value })}
                          placeholder="https://youtube.com/..."
                          className="mt-2"
                        />
                      </div>
                    )}

                    {(newPromotion.promotion_type === 'banner' || newPromotion.promotion_type === 'homepage') && (
                      <div>
                        <Label>{text.bannerImage}</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        {bannerFile && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {bannerFile.name}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label>{text.duration}</Label>
                      <Input
                        type="number"
                        value={newPromotion.duration_days}
                        onChange={(e) => setNewPromotion({ ...newPromotion, duration_days: parseInt(e.target.value) })}
                        min={1}
                      />
                    </div>

                    <div>
                      <Label>{text.amountPaid} ($)</Label>
                      <Input
                        type="number"
                        value={newPromotion.amount_paid}
                        onChange={(e) => setNewPromotion({ ...newPromotion, amount_paid: parseFloat(e.target.value) })}
                        min={0}
                      />
                    </div>

                    <Button
                      onClick={handleCreatePromotion}
                      disabled={!newPromotion.property_id || uploadingMedia}
                      className="w-full"
                    >
                      {uploadingMedia ? text.uploading : text.create}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{text.property}</TableHead>
                      <TableHead>{text.promotionType}</TableHead>
                      <TableHead>Media</TableHead>
                      <TableHead>{text.amountPaid}</TableHead>
                      <TableHead>{text.endDate}</TableHead>
                      <TableHead>{text.status}</TableHead>
                      <TableHead>{text.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promotions.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-medium">{promo.property_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPromotionIcon(promo.promotion_type)}
                            {getPromotionTypeLabel(promo.promotion_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {promo.banner_image_url && (
                              <a
                                href={promo.banner_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              >
                                <Image className="h-3 w-3" />
                                {text.viewBanner}
                              </a>
                            )}
                            {promo.video_url && (
                              <a
                                href={promo.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-500 hover:underline flex items-center gap-1"
                              >
                                <Video className="h-3 w-3" />
                                {text.viewVideo}
                              </a>
                            )}
                            {!promo.banner_image_url && !promo.video_url && (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(promo.amount_paid)}</TableCell>
                        <TableCell>{formatDate(promo.end_date)}</TableCell>
                        <TableCell>
                          <Badge variant={promo.is_active ? 'default' : 'secondary'}>
                            {promo.is_active ? text.active : text.expired}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {promo.is_active && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeactivatePromotion(promo.id)}
                            >
                              {text.deactivate}
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
