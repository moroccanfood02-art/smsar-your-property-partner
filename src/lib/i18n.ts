export type Language = 'ar' | 'en' | 'fr';

export const translations = {
  ar: {
    // Navigation
    home: 'الرئيسية',
    properties: 'العقارات',
    about: 'من نحن',
    contact: 'اتصل بنا',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    
    // Hero
    heroTitle: 'اعثر على منزل أحلامك',
    heroSubtitle: 'أكبر منصة عقارية في المنطقة، نوفر لك أفضل العقارات للبيع والكراء',
    searchPlaceholder: 'ابحث عن مدينة أو حي...',
    
    // Property Types
    forSale: 'للبيع',
    dailyRent: 'كراء يومي',
    monthlyRent: 'كراء شهري',
    permanentRent: 'كراء دائم',
    
    // Search
    search: 'بحث',
    advancedSearch: 'بحث متقدم',
    propertyType: 'نوع العقار',
    priceRange: 'نطاق السعر',
    bedrooms: 'غرف النوم',
    area: 'المساحة',
    location: 'الموقع',
    
    // Property Card
    sqm: 'م²',
    rooms: 'غرف',
    bathrooms: 'حمامات',
    available: 'متاح',
    sold: 'تم البيع',
    rented: 'تم الكراء',
    notAvailable: 'غير متاح',
    
    // Sections
    featuredProperties: 'عقارات مميزة',
    latestProperties: 'أحدث العقارات',
    viewAll: 'عرض الكل',
    
    // Actions
    book: 'حجز',
    contactOwner: 'تواصل مع المالك',
    viewDetails: 'عرض التفاصيل',
    
    // Auth
    email: 'البريد الإلكتروني',
    password: 'كلمة السر',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    forgotPassword: 'نسيت كلمة السر؟',
    
    // Footer
    allRightsReserved: 'جميع الحقوق محفوظة',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    
    // Stats
    properties_count: 'عقار',
    users_count: 'مستخدم',
    cities_count: 'مدينة',
    countries_count: 'دولة',
  },
  en: {
    // Navigation
    home: 'Home',
    properties: 'Properties',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    
    // Hero
    heroTitle: 'Find Your Dream Home',
    heroSubtitle: 'The largest real estate platform in the region, offering the best properties for sale and rent',
    searchPlaceholder: 'Search for a city or neighborhood...',
    
    // Property Types
    forSale: 'For Sale',
    dailyRent: 'Daily Rent',
    monthlyRent: 'Monthly Rent',
    permanentRent: 'Long-term Rent',
    
    // Search
    search: 'Search',
    advancedSearch: 'Advanced Search',
    propertyType: 'Property Type',
    priceRange: 'Price Range',
    bedrooms: 'Bedrooms',
    area: 'Area',
    location: 'Location',
    
    // Property Card
    sqm: 'sqm',
    rooms: 'rooms',
    bathrooms: 'baths',
    available: 'Available',
    sold: 'Sold',
    rented: 'Rented',
    notAvailable: 'Not Available',
    
    // Sections
    featuredProperties: 'Featured Properties',
    latestProperties: 'Latest Properties',
    viewAll: 'View All',
    
    // Actions
    book: 'Book',
    contactOwner: 'Contact Owner',
    viewDetails: 'View Details',
    
    // Auth
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    phone: 'Phone Number',
    forgotPassword: 'Forgot Password?',
    
    // Footer
    allRightsReserved: 'All Rights Reserved',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // Stats
    properties_count: 'Properties',
    users_count: 'Users',
    cities_count: 'Cities',
    countries_count: 'Countries',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    properties: 'Propriétés',
    about: 'À propos',
    contact: 'Contact',
    login: 'Connexion',
    register: 'S\'inscrire',
    
    // Hero
    heroTitle: 'Trouvez la Maison de Vos Rêves',
    heroSubtitle: 'La plus grande plateforme immobilière de la région, offrant les meilleures propriétés à vendre et à louer',
    searchPlaceholder: 'Rechercher une ville ou un quartier...',
    
    // Property Types
    forSale: 'À Vendre',
    dailyRent: 'Location Journalière',
    monthlyRent: 'Location Mensuelle',
    permanentRent: 'Location Longue Durée',
    
    // Search
    search: 'Rechercher',
    advancedSearch: 'Recherche Avancée',
    propertyType: 'Type de Propriété',
    priceRange: 'Fourchette de Prix',
    bedrooms: 'Chambres',
    area: 'Surface',
    location: 'Emplacement',
    
    // Property Card
    sqm: 'm²',
    rooms: 'pièces',
    bathrooms: 'sdb',
    available: 'Disponible',
    sold: 'Vendu',
    rented: 'Loué',
    notAvailable: 'Non Disponible',
    
    // Sections
    featuredProperties: 'Propriétés en Vedette',
    latestProperties: 'Dernières Propriétés',
    viewAll: 'Voir Tout',
    
    // Actions
    book: 'Réserver',
    contactOwner: 'Contacter le Propriétaire',
    viewDetails: 'Voir Détails',
    
    // Auth
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom Complet',
    phone: 'Numéro de Téléphone',
    forgotPassword: 'Mot de passe oublié?',
    
    // Footer
    allRightsReserved: 'Tous Droits Réservés',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    
    // Stats
    properties_count: 'Propriétés',
    users_count: 'Utilisateurs',
    cities_count: 'Villes',
    countries_count: 'Pays',
  },
};

export const getDirection = (lang: Language): 'rtl' | 'ltr' => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

export const useTranslation = (lang: Language) => {
  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };
  
  return { t, dir: getDirection(lang) };
};
