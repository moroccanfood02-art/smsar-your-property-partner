export type Language = 'ar' | 'en' | 'fr' | 'es';

export interface TranslationKeys {
  // Navigation
  home: string;
  properties: string;
  about: string;
  contact: string;
  login: string;
  register: string;
  dashboard: string;
  profile: string;
  securitySettings: string;
  messages: string;
  favorites: string;
  myProperties: string;
  addProperty: string;
  adminPanel: string;
  signOut: string;
  customer: string;
  owner: string;
  admin: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;

  // Property Types
  forSale: string;
  dailyRent: string;
  monthlyRent: string;
  permanentRent: string;

  // Property Categories
  apartment: string;
  villa: string;
  house: string;
  land: string;
  commercial: string;
  office: string;

  // Search
  search: string;
  advancedSearch: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
  area: string;
  location: string;

  // Property Card
  sqm: string;
  rooms: string;
  bathrooms: string;
  available: string;
  sold: string;
  rented: string;
  notAvailable: string;

  // Sections
  featuredProperties: string;
  latestProperties: string;
  promotedProperties: string;
  viewAll: string;
  whyChooseUs: string;

  // Actions
  book: string;
  contactOwner: string;
  viewDetails: string;
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  create: string;
  confirm: string;
  close: string;
  back: string;
  next: string;
  submit: string;
  loading: string;

  // Auth
  email: string;
  password: string;
  fullName: string;
  phone: string;
  forgotPassword: string;
  resetPassword: string;
  verificationCode: string;
  sendCode: string;
  verify: string;
  newPassword: string;
  confirmPassword: string;
  country: string;
  selectCountry: string;
  accountType: string;

  // Footer
  allRightsReserved: string;
  privacyPolicy: string;
  termsOfService: string;
  quickLinks: string;
  propertyTypes: string;
  contactUs: string;

  // Stats
  properties_count: string;
  users_count: string;
  cities_count: string;
  countries_count: string;

  // Contact Page
  contactTitle: string;
  contactSubtitle: string;
  name: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  messageSent: string;
  address: string;
  workingHours: string;
  mondayToFriday: string;
  saturday: string;

  // About Page
  aboutTitle: string;
  aboutSubtitle: string;
  ourMission: string;
  ourMissionText: string;
  ourVision: string;
  ourVisionText: string;
  ourValues: string;
  transparency: string;
  trust: string;
  innovation: string;
  customerFirst: string;

  // Owner Dashboard
  ownerDashboard: string;
  totalViews: string;
  totalMessages: string;
  activeListings: string;
  editProperty: string;
  deleteProperty: string;
  propertyStatus: string;
  statistics: string;
  recentMessages: string;
  viewAllMessages: string;
  noProperties: string;
  addFirstProperty: string;
  confirmDelete: string;
  deleteMessage: string;
  views: string;
  overview: string;
  analytics: string;
  totalTransactions: string;
  commissionDue: string;
  earningsToday: string;
  earningsMonth: string;
  transactionsTab: string;
  transactionType: string;
  amount: string;
  commission: string;
  paid: string;
  unpaid: string;
  date: string;
  noTransactions: string;
  noMessages: string;
  regarding: string;
  propertyDeleted: string;
  noAccess: string;
  viewsChart: string;
  revenueChart: string;
  propertiesByStatus: string;
  monthlyEarnings: string;

  // Admin Dashboard
  adminDashboard: string;
  users_tab: string;
  totalProperties: string;
  totalUsers: string;
  totalCommission: string;
  paidCommission: string;
  unpaidCommission: string;
  activePromotions: string;
  role_label: string;
  actions: string;
  city: string;
  price: string;
  status: string;
  ownerLabel: string;
  markPaid: string;
  deleteSuccess: string;
  deleteError: string;
  daily_rent: string;
  monthly_rent: string;
  permanent_rent: string;
  sale: string;
  markedPaid: string;
  addPromotion: string;
  selectProperty: string;
  promotionType: string;
  featured: string;
  video_ad: string;
  banner: string;
  homepage: string;
  videoUrl: string;
  duration: string;
  amountPaid: string;
  promotionCreated: string;
  endDate: string;
  active: string;
  expired: string;
  deactivate: string;
  property: string;
  bannerImage: string;
  uploadBanner: string;
  uploadVideo: string;
  uploading: string;
  viewBanner: string;
  viewVideo: string;
  mediaRequired: string;
  videoRequired: string;
  bannerRequired: string;
  downloadPDF: string;
  promotionsReport: string;
  transactionsReport: string;
  propertiesReport: string;
  checkExpiring: string;
  checkingExpiring: string;
  notificationsSent: string;
  autoRenew: string;
  autoRenewing: string;
  autoRenewComplete: string;
  promotionStats: string;
  monthlyRevenue: string;
  promotionsByType: string;

  // Notifications
  notifications: string;
  noNotifications: string;
  markAllRead: string;

  // Pricing
  pricingTitle: string;
  pricingSubtitle: string;
  monthly: string;
  yearly: string;
  subscribe: string;
  currentPlan: string;
  freePlan: string;
  proPlan: string;
  premiumPlan: string;

  // Misc
  description: string;
  images: string;
  currency: string;
  amenities: string;
  latitude: string;
  longitude: string;
  title: string;
}

export type Translations = Record<Language, TranslationKeys>;
