import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Receipt, Megaphone, Users, Building2 } from 'lucide-react';
import { generatePromotionsReport, generateTransactionsReport, generatePropertiesReport } from '@/utils/pdfReports';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminOverviewCharts from '@/components/admin/AdminOverviewCharts';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminPropertiesTab from '@/components/admin/AdminPropertiesTab';
import AdminTransactionsTab from '@/components/admin/AdminTransactionsTab';
import AdminPromotionsTab from '@/components/admin/AdminPromotionsTab';

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
    totalProperties: 0, totalUsers: 0, totalMessages: 0, totalViews: 0,
    totalTransactions: 0, totalCommission: 0, paidCommission: 0, unpaidCommission: 0, activePromotions: 0,
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
  const [checkingExpiring, setCheckingExpiring] = useState(false);
  const [autoRenewing, setAutoRenewing] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    property_id: '', promotion_type: 'featured', video_url: '', banner_image_url: '', duration_days: 7, amount_paid: 50,
  });

  const t = {
    ar: {
      title: 'لوحة تحكم المدير', overview: 'نظرة عامة', users: 'المستخدمون', properties: 'العقارات',
      transactions: 'المعاملات', promotions: 'الإعلانات', totalProperties: 'إجمالي العقارات',
      totalUsers: 'إجمالي المستخدمين', totalMessages: 'إجمالي الرسائل', totalViews: 'إجمالي المشاهدات',
      totalTransactions: 'إجمالي المعاملات', totalCommission: 'إجمالي العمولات',
      paidCommission: 'العمولات المدفوعة', unpaidCommission: 'العمولات المستحقة',
      activePromotions: 'الإعلانات النشطة', name: 'الاسم', phone: 'الهاتف', role: 'الدور',
      date: 'التاريخ', actions: 'الإجراءات', city: 'المدينة', price: 'السعر', status: 'الحالة',
      owner: 'المالك', delete: 'حذف', markPaid: 'تحديد كمدفوع', customer: 'زبون', ownerRole: 'مالك',
      admin: 'مدير', available: 'متاح', sold: 'مباع', rented: 'مؤجر', noAccess: 'ليس لديك صلاحية الوصول',
      deleteSuccess: 'تم الحذف بنجاح', deleteError: 'حدث خطأ أثناء الحذف', transactionType: 'نوع المعاملة',
      amount: 'المبلغ', commission: 'العمولة', paid: 'مدفوع', unpaid: 'غير مدفوع',
      daily_rent: 'كراء يومي', monthly_rent: 'كراء شهري', permanent_rent: 'كراء دائم', sale: 'بيع',
      markedPaid: 'تم تحديد العمولة كمدفوعة', addPromotion: 'إضافة إعلان', selectProperty: 'اختر العقار',
      promotionType: 'نوع الإعلان', featured: 'مميز', video_ad: 'إعلان فيديو', banner: 'بانر',
      homepage: 'الصفحة الرئيسية', videoUrl: 'رابط الفيديو', duration: 'المدة (أيام)',
      amountPaid: 'المبلغ المدفوع', create: 'إنشاء', promotionCreated: 'تم إنشاء الإعلان بنجاح',
      endDate: 'تاريخ الانتهاء', active: 'نشط', expired: 'منتهي', deactivate: 'إلغاء التفعيل',
      property: 'العقار', bannerImage: 'صورة البانر', uploadBanner: 'رفع صورة', uploadVideo: 'رفع فيديو',
      uploading: 'جاري الرفع...', viewBanner: 'عرض البانر', viewVideo: 'عرض الفيديو',
      mediaRequired: 'الوسائط مطلوبة', videoRequired: 'يرجى رفع فيديو للإعلان من نوع فيديو',
      bannerRequired: 'يرجى رفع صورة للإعلان من نوع بانر', downloadPDF: 'تحميل PDF',
      checkExpiring: 'فحص المنتهية', checkingExpiring: 'جاري الفحص...', notificationsSent: 'تم إرسال الإشعارات',
      autoRenew: 'التجديد التلقائي', autoRenewing: 'جاري التجديد...', autoRenewComplete: 'تم فحص الإعلانات المنتهية',
      promotionsByType: 'الإعلانات حسب النوع', monthlyRevenue: 'الإيرادات الشهرية',
    },
    fr: {
      title: 'Tableau de Bord Admin', overview: 'Aperçu', users: 'Utilisateurs', properties: 'Propriétés',
      transactions: 'Transactions', promotions: 'Promotions', totalProperties: 'Total Propriétés',
      totalUsers: 'Total Utilisateurs', totalMessages: 'Total Messages', totalViews: 'Total Vues',
      totalTransactions: 'Total Transactions', totalCommission: 'Total Commissions',
      paidCommission: 'Commissions Payées', unpaidCommission: 'Commissions Dues',
      activePromotions: 'Promotions Actives', name: 'Nom', phone: 'Téléphone', role: 'Rôle',
      date: 'Date', actions: 'Actions', city: 'Ville', price: 'Prix', status: 'Statut',
      owner: 'Propriétaire', delete: 'Supprimer', markPaid: 'Marquer Payé', customer: 'Client',
      ownerRole: 'Propriétaire', admin: 'Admin', available: 'Disponible', sold: 'Vendu', rented: 'Loué',
      noAccess: "Vous n'avez pas accès", deleteSuccess: 'Supprimé avec succès',
      deleteError: 'Erreur lors de la suppression', transactionType: 'Type', amount: 'Montant',
      commission: 'Commission', paid: 'Payé', unpaid: 'Non Payé', daily_rent: 'Location Journalière',
      monthly_rent: 'Location Mensuelle', permanent_rent: 'Location Permanente', sale: 'Vente',
      markedPaid: 'Commission marquée comme payée', addPromotion: 'Ajouter Promotion',
      selectProperty: 'Sélectionner Propriété', promotionType: 'Type de Promotion', featured: 'En Vedette',
      video_ad: 'Pub Vidéo', banner: 'Bannière', homepage: 'Page Accueil', videoUrl: 'URL Vidéo',
      duration: 'Durée (jours)', amountPaid: 'Montant Payé', create: 'Créer',
      promotionCreated: 'Promotion créée avec succès', endDate: 'Date Fin', active: 'Actif', expired: 'Expiré',
      deactivate: 'Désactiver', property: 'Propriété', bannerImage: 'Image Bannière',
      uploadBanner: 'Télécharger Image', uploadVideo: 'Télécharger Vidéo', uploading: 'Téléchargement...',
      viewBanner: 'Voir Bannière', viewVideo: 'Voir Vidéo', mediaRequired: 'Média requis',
      videoRequired: 'Veuillez télécharger une vidéo', bannerRequired: 'Veuillez télécharger une image',
      downloadPDF: 'Télécharger PDF', checkExpiring: 'Vérifier Expirations', checkingExpiring: 'Vérification...',
      notificationsSent: 'Notifications envoyées', autoRenew: 'Renouvellement Auto',
      autoRenewing: 'Renouvellement...', autoRenewComplete: 'Promotions vérifiées',
      promotionsByType: 'Promotions par Type', monthlyRevenue: 'Revenus Mensuels',
    },
    en: {
      title: 'Admin Dashboard', overview: 'Overview', users: 'Users', properties: 'Properties',
      transactions: 'Transactions', promotions: 'Promotions', totalProperties: 'Total Properties',
      totalUsers: 'Total Users', totalMessages: 'Total Messages', totalViews: 'Total Views',
      totalTransactions: 'Total Transactions', totalCommission: 'Total Commission',
      paidCommission: 'Paid Commission', unpaidCommission: 'Unpaid Commission',
      activePromotions: 'Active Promotions', name: 'Name', phone: 'Phone', role: 'Role',
      date: 'Date', actions: 'Actions', city: 'City', price: 'Price', status: 'Status',
      owner: 'Owner', delete: 'Delete', markPaid: 'Mark Paid', customer: 'Customer',
      ownerRole: 'Owner', admin: 'Admin', available: 'Available', sold: 'Sold', rented: 'Rented',
      noAccess: "You don't have access", deleteSuccess: 'Deleted successfully',
      deleteError: 'Error deleting', transactionType: 'Type', amount: 'Amount',
      commission: 'Commission', paid: 'Paid', unpaid: 'Unpaid', daily_rent: 'Daily Rent',
      monthly_rent: 'Monthly Rent', permanent_rent: 'Permanent Rent', sale: 'Sale',
      markedPaid: 'Commission marked as paid', addPromotion: 'Add Promotion',
      selectProperty: 'Select Property', promotionType: 'Promotion Type', featured: 'Featured',
      video_ad: 'Video Ad', banner: 'Banner', homepage: 'Homepage', videoUrl: 'Video URL',
      duration: 'Duration (days)', amountPaid: 'Amount Paid', create: 'Create',
      promotionCreated: 'Promotion created', endDate: 'End Date', active: 'Active', expired: 'Expired',
      deactivate: 'Deactivate', property: 'Property', bannerImage: 'Banner Image',
      uploadBanner: 'Upload Image', uploadVideo: 'Upload Video', uploading: 'Uploading...',
      viewBanner: 'View Banner', viewVideo: 'View Video', mediaRequired: 'Media required',
      videoRequired: 'Please upload a video', bannerRequired: 'Please upload an image',
      downloadPDF: 'Download PDF', checkExpiring: 'Check Expiring', checkingExpiring: 'Checking...',
      notificationsSent: 'Notifications sent', autoRenew: 'Auto Renew', autoRenewing: 'Renewing...',
      autoRenewComplete: 'Expired promotions checked', promotionsByType: 'Promotions by Type',
      monthlyRevenue: 'Monthly Revenue',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    if (!authLoading) {
      if (!user) navigate('/auth');
      else if (role !== 'admin') {
        navigate('/');
        toast({ title: text.noAccess, variant: 'destructive' });
      }
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user && role === 'admin') fetchData();
  }, [user, role]);

  const fetchData = async () => {
    const [propertiesRes, usersRes, messagesRes, transactionsRes, promotionsRes] = await Promise.all([
      supabase.from('properties').select('id, views_count, title, city, price, currency, status, created_at, owner_id'),
      supabase.from('profiles').select('id'),
      supabase.from('messages').select('id'),
      supabase.from('transactions').select('*'),
      supabase.from('property_promotions').select('*').order('created_at', { ascending: false }),
    ]);

    const totalViews = (propertiesRes.data || []).reduce((sum, p) => sum + (p.views_count || 0), 0);
    const transactionsData = transactionsRes.data || [];
    const totalCommission = transactionsData.reduce((sum: number, tx: any) => sum + (tx.commission_amount || 0), 0);
    const paidCommission = transactionsData.filter((tx: any) => tx.commission_paid).reduce((sum: number, tx: any) => sum + (tx.commission_amount || 0), 0);
    const activePromos = (promotionsRes.data || []).filter((p: any) => p.is_active && new Date(p.end_date) > new Date()).length;

    setStats({
      totalProperties: propertiesRes.data?.length || 0, totalUsers: usersRes.data?.length || 0,
      totalMessages: messagesRes.data?.length || 0, totalViews, totalTransactions: transactionsData.length,
      totalCommission, paidCommission, unpaidCommission: totalCommission - paidCommission, activePromotions: activePromos,
    });

    // Users with roles
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const usersWithRoles: UserData[] = [];
    for (const profile of profilesData || []) {
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', profile.user_id).maybeSingle();
      usersWithRoles.push({ ...profile, role: roleData?.role || 'customer' });
    }
    setUsers(usersWithRoles);

    // Properties with owners
    const propertiesWithOwners: PropertyData[] = [];
    for (const property of propertiesRes.data || []) {
      const { data: ownerProfile } = await supabase.from('profiles').select('full_name').eq('user_id', property.owner_id).maybeSingle();
      propertiesWithOwners.push({ ...property, owner_name: ownerProfile?.full_name || '—', owner_id: property.owner_id });
    }
    setProperties(propertiesWithOwners);

    // Transactions enriched
    const enrichedTransactions: TransactionData[] = [];
    for (const tx of transactionsData) {
      const { data: ownerProfile } = await supabase.from('profiles').select('full_name').eq('user_id', tx.owner_id).maybeSingle();
      let propertyTitle = null;
      if (tx.property_id) {
        const { data: property } = await supabase.from('properties').select('title').eq('id', tx.property_id).maybeSingle();
        propertyTitle = property?.title;
      }
      enrichedTransactions.push({ ...tx, owner_name: ownerProfile?.full_name || '—', property_title: propertyTitle });
    }
    setTransactions(enrichedTransactions);

    // Promotions enriched
    const enrichedPromotions: PromotionData[] = [];
    for (const promo of promotionsRes.data || []) {
      const property = propertiesWithOwners.find((p) => p.id === promo.property_id);
      enrichedPromotions.push({
        ...promo, property_title: property?.title || '—',
        is_active: promo.is_active && new Date(promo.end_date) > new Date(),
      });
    }
    setPromotions(enrichedPromotions);
    setLoading(false);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', propertyId);
    if (error) toast({ title: text.deleteError, variant: 'destructive' });
    else { toast({ title: text.deleteSuccess }); setProperties((prev) => prev.filter((p) => p.id !== propertyId)); }
  };

  const handleMarkPaid = async (transactionId: string) => {
    const { error } = await supabase.from('transactions').update({ commission_paid: true, paid_at: new Date().toISOString() }).eq('id', transactionId);
    if (!error) { toast({ title: text.markedPaid }); fetchData(); }
  };

  const handleCreatePromotion = async () => {
    const property = properties.find((p) => p.id === newPromotion.property_id);
    if (!property) return;
    if (newPromotion.promotion_type === 'video_ad' && !videoFile && !newPromotion.video_url) {
      toast({ title: text.mediaRequired, description: text.videoRequired, variant: 'destructive' }); return;
    }
    if (newPromotion.promotion_type === 'banner' && !bannerFile && !newPromotion.banner_image_url) {
      toast({ title: text.mediaRequired, description: text.bannerRequired, variant: 'destructive' }); return;
    }
    setUploadingMedia(true);
    let videoUrl = newPromotion.video_url || null;
    let bannerUrl = newPromotion.banner_image_url || null;
    try {
      if (bannerFile) {
        const fileName = `${newPromotion.property_id}-banner-${Date.now()}.${bannerFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('promotion-media').upload(fileName, bannerFile);
        if (!uploadError) bannerUrl = supabase.storage.from('promotion-media').getPublicUrl(fileName).data.publicUrl;
      }
      if (videoFile) {
        const fileName = `${newPromotion.property_id}-video-${Date.now()}.${videoFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('promotion-media').upload(fileName, videoFile);
        if (!uploadError) videoUrl = supabase.storage.from('promotion-media').getPublicUrl(fileName).data.publicUrl;
      }
      const endDate = new Date(); endDate.setDate(endDate.getDate() + newPromotion.duration_days);
      const { error } = await supabase.from('property_promotions').insert({
        property_id: newPromotion.property_id, owner_id: property.owner_id, promotion_type: newPromotion.promotion_type,
        video_url: videoUrl, banner_image_url: bannerUrl, end_date: endDate.toISOString(), amount_paid: newPromotion.amount_paid, is_active: true,
      });
      if (!error) {
        toast({ title: text.promotionCreated }); setShowPromotionDialog(false);
        setNewPromotion({ property_id: '', promotion_type: 'featured', video_url: '', banner_image_url: '', duration_days: 7, amount_paid: 50 });
        setBannerFile(null); setVideoFile(null);
        await supabase.from('notifications').insert({
          user_id: property.owner_id, title: 'إعلان جديد لعقارك',
          message: `تم تفعيل إعلان لعقارك "${property.title}" لمدة ${newPromotion.duration_days} أيام`,
          type: 'promotion', link: '/owner-dashboard',
        });
        fetchData();
      }
    } catch (error) { console.error('Error:', error); }
    finally { setUploadingMedia(false); }
  };

  const handleDeactivatePromotion = async (promotionId: string) => {
    const { error } = await supabase.from('property_promotions').update({ is_active: false }).eq('id', promotionId);
    if (!error) fetchData();
  };

  const handleCheckExpiringPromotions = async () => {
    setCheckingExpiring(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-expiring-promotions');
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: text.notificationsSent, description: `${data.notificationsSent}` });
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setCheckingExpiring(false); }
  };

  const handleAutoRenewPromotions = async () => {
    setAutoRenewing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-renew-promotions');
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else { toast({ title: text.autoRenewComplete }); fetchData(); }
    } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); }
    finally { setAutoRenewing(false); }
  };

  const formatPrice = (price: number, currency: string = 'USD') =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-MA').format(price) + ' ' + currency;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-MA');

  const getRoleLabel = (userRole: string) => ({ customer: text.customer, owner: text.ownerRole, admin: text.admin }[userRole] || userRole);
  const getStatusLabel = (status: string) => ({ available: text.available, sold: text.sold, rented: text.rented }[status] || status);
  const getTransactionTypeLabel = (type: string) => ({ daily_rent: text.daily_rent, monthly_rent: text.monthly_rent, permanent_rent: text.permanent_rent, sale: text.sale }[type] || type);
  const getPromotionTypeLabel = (type: string) => ({ featured: text.featured, video_ad: text.video_ad, banner: text.banner, homepage: text.homepage }[type] || type);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{text.title}</h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'إدارة شاملة للمنصة والعقارات والمستخدمين' : 'Comprehensive platform management'}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/60 p-1 h-auto flex-wrap">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:shadow-sm">
              <LayoutDashboard className="h-4 w-4" /> {text.overview}
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2 data-[state=active]:shadow-sm">
              <Receipt className="h-4 w-4" /> {text.transactions}
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2 data-[state=active]:shadow-sm">
              <Megaphone className="h-4 w-4" /> {text.promotions}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" /> {text.users}
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2 data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4" /> {text.properties}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStatsCards stats={stats} text={text} formatPrice={formatPrice} />
            <AdminOverviewCharts
              promotions={promotions}
              transactions={transactions}
              properties={properties}
              text={text}
              language={language}
              formatPrice={formatPrice}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <AdminTransactionsTab
              transactions={transactions} text={text} formatPrice={formatPrice}
              formatDate={formatDate} getTransactionTypeLabel={getTransactionTypeLabel}
              onMarkPaid={handleMarkPaid} onExportPDF={() => generateTransactionsReport(transactions, language)}
            />
          </TabsContent>

          <TabsContent value="promotions">
            <AdminPromotionsTab
              promotions={promotions} properties={properties} text={text} language={language}
              formatPrice={formatPrice} formatDate={formatDate}
              showPromotionDialog={showPromotionDialog} setShowPromotionDialog={setShowPromotionDialog}
              newPromotion={newPromotion} setNewPromotion={setNewPromotion}
              bannerFile={bannerFile} setBannerFile={setBannerFile}
              videoFile={videoFile} setVideoFile={setVideoFile}
              uploadingMedia={uploadingMedia} checkingExpiring={checkingExpiring} autoRenewing={autoRenewing}
              onCreatePromotion={handleCreatePromotion} onDeactivate={handleDeactivatePromotion}
              onCheckExpiring={handleCheckExpiringPromotions} onAutoRenew={handleAutoRenewPromotions}
              onExportPDF={() => generatePromotionsReport(promotions, language)}
              getPromotionTypeLabel={getPromotionTypeLabel}
            />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab users={users} text={text} formatDate={formatDate} getRoleLabel={getRoleLabel} />
          </TabsContent>

          <TabsContent value="properties">
            <AdminPropertiesTab
              properties={properties} text={text} formatPrice={formatPrice}
              formatDate={formatDate} getStatusLabel={getStatusLabel}
              onDelete={handleDeleteProperty} onExportPDF={() => generatePropertiesReport(properties, language)}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
