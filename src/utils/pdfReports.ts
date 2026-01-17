import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA');
};

const formatPrice = (price: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

const getPromotionTypeLabel = (type: string, language: string) => {
  const labels: Record<string, Record<string, string>> = {
    ar: {
      featured: 'مميز',
      video_ad: 'إعلان فيديو',
      banner: 'بانر',
      homepage: 'الصفحة الرئيسية',
    },
    en: {
      featured: 'Featured',
      video_ad: 'Video Ad',
      banner: 'Banner',
      homepage: 'Homepage',
    },
    fr: {
      featured: 'En Vedette',
      video_ad: 'Pub Vidéo',
      banner: 'Bannière',
      homepage: "Page d'Accueil",
    },
  };
  return labels[language]?.[type] || type;
};

const getTransactionTypeLabel = (type: string, language: string) => {
  const labels: Record<string, Record<string, string>> = {
    ar: {
      sale: 'بيع',
      daily_rent: 'كراء يومي',
      monthly_rent: 'كراء شهري',
      permanent_rent: 'كراء دائم',
    },
    en: {
      sale: 'Sale',
      daily_rent: 'Daily Rent',
      monthly_rent: 'Monthly Rent',
      permanent_rent: 'Permanent Rent',
    },
    fr: {
      sale: 'Vente',
      daily_rent: 'Location Journalière',
      monthly_rent: 'Location Mensuelle',
      permanent_rent: 'Location Permanente',
    },
  };
  return labels[language]?.[type] || type;
};

export const generatePromotionsReport = (promotions: PromotionData[], language: string) => {
  const doc = new jsPDF();
  const isRTL = language === 'ar';
  
  const t = {
    ar: {
      title: 'تقرير الإعلانات',
      property: 'العقار',
      type: 'النوع',
      amount: 'المبلغ',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      status: 'الحالة',
      active: 'نشط',
      expired: 'منتهي',
      summary: 'ملخص',
      totalAds: 'إجمالي الإعلانات',
      activeAds: 'الإعلانات النشطة',
      expiredAds: 'الإعلانات المنتهية',
      totalRevenue: 'إجمالي الإيرادات',
      generatedOn: 'تاريخ التقرير',
    },
    en: {
      title: 'Promotions Report',
      property: 'Property',
      type: 'Type',
      amount: 'Amount',
      startDate: 'Start Date',
      endDate: 'End Date',
      status: 'Status',
      active: 'Active',
      expired: 'Expired',
      summary: 'Summary',
      totalAds: 'Total Ads',
      activeAds: 'Active Ads',
      expiredAds: 'Expired Ads',
      totalRevenue: 'Total Revenue',
      generatedOn: 'Generated On',
    },
    fr: {
      title: 'Rapport des Promotions',
      property: 'Propriété',
      type: 'Type',
      amount: 'Montant',
      startDate: 'Date Début',
      endDate: 'Date Fin',
      status: 'Statut',
      active: 'Actif',
      expired: 'Expiré',
      summary: 'Résumé',
      totalAds: 'Total Annonces',
      activeAds: 'Annonces Actives',
      expiredAds: 'Annonces Expirées',
      totalRevenue: 'Revenu Total',
      generatedOn: 'Généré le',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  // Title
  doc.setFontSize(20);
  doc.text(text.title, 105, 20, { align: 'center' });

  // Summary section
  doc.setFontSize(14);
  doc.text(text.summary, 14, 35);
  
  doc.setFontSize(10);
  const activeCount = promotions.filter(p => p.is_active).length;
  const expiredCount = promotions.filter(p => !p.is_active).length;
  const totalRevenue = promotions.reduce((sum, p) => sum + p.amount_paid, 0);

  doc.text(`${text.totalAds}: ${promotions.length}`, 14, 45);
  doc.text(`${text.activeAds}: ${activeCount}`, 14, 52);
  doc.text(`${text.expiredAds}: ${expiredCount}`, 14, 59);
  doc.text(`${text.totalRevenue}: ${formatPrice(totalRevenue)}`, 14, 66);
  doc.text(`${text.generatedOn}: ${formatDate(new Date().toISOString())}`, 14, 73);

  // Table
  const tableData = promotions.map(promo => [
    promo.property_title,
    getPromotionTypeLabel(promo.promotion_type, language),
    formatPrice(promo.amount_paid),
    formatDate(promo.start_date),
    formatDate(promo.end_date),
    promo.is_active ? text.active : text.expired,
  ]);

  doc.autoTable({
    startY: 80,
    head: [[text.property, text.type, text.amount, text.startDate, text.endDate, text.status]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`promotions-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateTransactionsReport = (transactions: TransactionData[], language: string) => {
  const doc = new jsPDF();
  
  const t = {
    ar: {
      title: 'تقرير المعاملات',
      owner: 'المالك',
      type: 'النوع',
      amount: 'المبلغ',
      commission: 'العمولة',
      status: 'الحالة',
      date: 'التاريخ',
      paid: 'مدفوع',
      unpaid: 'غير مدفوع',
      summary: 'ملخص',
      totalTransactions: 'إجمالي المعاملات',
      totalAmount: 'إجمالي المبالغ',
      totalCommission: 'إجمالي العمولات',
      paidCommission: 'العمولات المدفوعة',
      unpaidCommission: 'العمولات المستحقة',
      generatedOn: 'تاريخ التقرير',
    },
    en: {
      title: 'Transactions Report',
      owner: 'Owner',
      type: 'Type',
      amount: 'Amount',
      commission: 'Commission',
      status: 'Status',
      date: 'Date',
      paid: 'Paid',
      unpaid: 'Unpaid',
      summary: 'Summary',
      totalTransactions: 'Total Transactions',
      totalAmount: 'Total Amount',
      totalCommission: 'Total Commission',
      paidCommission: 'Paid Commission',
      unpaidCommission: 'Unpaid Commission',
      generatedOn: 'Generated On',
    },
    fr: {
      title: 'Rapport des Transactions',
      owner: 'Propriétaire',
      type: 'Type',
      amount: 'Montant',
      commission: 'Commission',
      status: 'Statut',
      date: 'Date',
      paid: 'Payé',
      unpaid: 'Non Payé',
      summary: 'Résumé',
      totalTransactions: 'Total Transactions',
      totalAmount: 'Montant Total',
      totalCommission: 'Commission Totale',
      paidCommission: 'Commission Payée',
      unpaidCommission: 'Commission Due',
      generatedOn: 'Généré le',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  // Title
  doc.setFontSize(20);
  doc.text(text.title, 105, 20, { align: 'center' });

  // Summary section
  doc.setFontSize(14);
  doc.text(text.summary, 14, 35);
  
  doc.setFontSize(10);
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.transaction_amount, 0);
  const totalCommission = transactions.reduce((sum, tx) => sum + tx.commission_amount, 0);
  const paidCommission = transactions.filter(tx => tx.commission_paid).reduce((sum, tx) => sum + tx.commission_amount, 0);
  const unpaidCommission = transactions.filter(tx => !tx.commission_paid).reduce((sum, tx) => sum + tx.commission_amount, 0);

  doc.text(`${text.totalTransactions}: ${transactions.length}`, 14, 45);
  doc.text(`${text.totalAmount}: ${formatPrice(totalAmount)}`, 14, 52);
  doc.text(`${text.totalCommission}: ${formatPrice(totalCommission)}`, 14, 59);
  doc.text(`${text.paidCommission}: ${formatPrice(paidCommission)}`, 14, 66);
  doc.text(`${text.unpaidCommission}: ${formatPrice(unpaidCommission)}`, 14, 73);
  doc.text(`${text.generatedOn}: ${formatDate(new Date().toISOString())}`, 14, 80);

  // Table
  const tableData = transactions.map(tx => [
    tx.owner_name,
    getTransactionTypeLabel(tx.transaction_type, language),
    formatPrice(tx.transaction_amount),
    formatPrice(tx.commission_amount),
    tx.commission_paid ? text.paid : text.unpaid,
    formatDate(tx.created_at),
  ]);

  doc.autoTable({
    startY: 90,
    head: [[text.owner, text.type, text.amount, text.commission, text.status, text.date]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [46, 204, 113], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`transactions-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generatePropertiesReport = (properties: PropertyData[], language: string) => {
  const doc = new jsPDF();
  
  const t = {
    ar: {
      title: 'تقرير العقارات',
      property: 'العقار',
      city: 'المدينة',
      price: 'السعر',
      status: 'الحالة',
      owner: 'المالك',
      date: 'التاريخ',
      summary: 'ملخص',
      totalProperties: 'إجمالي العقارات',
      available: 'متاح',
      sold: 'مباع',
      rented: 'مؤجر',
      generatedOn: 'تاريخ التقرير',
    },
    en: {
      title: 'Properties Report',
      property: 'Property',
      city: 'City',
      price: 'Price',
      status: 'Status',
      owner: 'Owner',
      date: 'Date',
      summary: 'Summary',
      totalProperties: 'Total Properties',
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
      generatedOn: 'Generated On',
    },
    fr: {
      title: 'Rapport des Propriétés',
      property: 'Propriété',
      city: 'Ville',
      price: 'Prix',
      status: 'Statut',
      owner: 'Propriétaire',
      date: 'Date',
      summary: 'Résumé',
      totalProperties: 'Total Propriétés',
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
      generatedOn: 'Généré le',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;
  const statusLabels: Record<string, string> = {
    available: text.available,
    sold: text.sold,
    rented: text.rented,
  };

  // Title
  doc.setFontSize(20);
  doc.text(text.title, 105, 20, { align: 'center' });

  // Summary section
  doc.setFontSize(14);
  doc.text(text.summary, 14, 35);
  
  doc.setFontSize(10);
  const availableCount = properties.filter(p => p.status === 'available').length;
  const soldCount = properties.filter(p => p.status === 'sold').length;
  const rentedCount = properties.filter(p => p.status === 'rented').length;

  doc.text(`${text.totalProperties}: ${properties.length}`, 14, 45);
  doc.text(`${text.available}: ${availableCount}`, 14, 52);
  doc.text(`${text.sold}: ${soldCount}`, 14, 59);
  doc.text(`${text.rented}: ${rentedCount}`, 14, 66);
  doc.text(`${text.generatedOn}: ${formatDate(new Date().toISOString())}`, 14, 73);

  // Table
  const tableData = properties.map(prop => [
    prop.title,
    prop.city,
    formatPrice(prop.price, prop.currency),
    statusLabels[prop.status] || prop.status,
    prop.owner_name,
    formatDate(prop.created_at),
  ]);

  doc.autoTable({
    startY: 80,
    head: [[text.property, text.city, text.price, text.status, text.owner, text.date]],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [155, 89, 182], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`properties-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
