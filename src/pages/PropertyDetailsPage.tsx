import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Maximize, ArrowLeft, ArrowRight, 
  Phone, MessageSquare, Share2, Heart, Calendar, Eye, Home, 
  Building2, Loader2, ChevronLeft, ChevronRight,
  Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyMap from '@/components/property/PropertyMap';
import SendMessageDialog from '@/components/property/SendMessageDialog';
import { useFavorites } from '@/hooks/useFavorites';
import { toast } from 'sonner';

interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  listing_type: string;
  status: string;
  price: number;
  currency: string;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  amenities: string[];
  featured: boolean;
  views_count: number | null;
  created_at: string;
  owner_id: string;
}

interface OwnerProfile {
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
}

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, dir } = useLanguage();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites({ language });

  const translations = {
    ar: {
      back: 'العودة',
      propertyDetails: 'تفاصيل العقار',
      description: 'الوصف',
      features: 'المميزات',
      location: 'الموقع',
      contactOwner: 'تواصل مع المالك',
      call: 'اتصال',
      message: 'رسالة',
      share: 'مشاركة',
      favorite: 'المفضلة',
      forSale: 'للبيع',
      dailyRent: 'كراء يومي',
      monthlyRent: 'كراء شهري',
      permanentRent: 'كراء دائم',
      apartment: 'شقة',
      villa: 'فيلا',
      house: 'منزل',
      land: 'أرض',
      commercial: 'تجاري',
      office: 'مكتب',
      available: 'متاح',
      sold: 'تم البيع',
      rented: 'تم الكراء',
      unavailable: 'غير متاح',
      sqm: 'م²',
      rooms: 'غرف نوم',
      baths: 'حمامات',
      area: 'المساحة',
      propertyType: 'نوع العقار',
      listingType: 'نوع العرض',
      status: 'الحالة',
      views: 'مشاهدة',
      postedOn: 'تاريخ النشر',
      amenities: 'المرافق',
      ownerInfo: 'معلومات المالك',
      notFound: 'العقار غير موجود',
      notFoundDesc: 'لم يتم العثور على العقار المطلوب',
      backToProperties: 'العودة للعقارات',
      copied: 'تم النسخ',
      linkCopied: 'تم نسخ الرابط',
      addedToFavorites: 'تمت الإضافة للمفضلة',
      removedFromFavorites: 'تمت الإزالة من المفضلة',
      noDescription: 'لا يوجد وصف متاح',
      noAmenities: 'لا توجد مرافق محددة',
    },
    en: {
      back: 'Back',
      propertyDetails: 'Property Details',
      description: 'Description',
      features: 'Features',
      location: 'Location',
      contactOwner: 'Contact Owner',
      call: 'Call',
      message: 'Message',
      share: 'Share',
      favorite: 'Favorite',
      forSale: 'For Sale',
      dailyRent: 'Daily Rent',
      monthlyRent: 'Monthly Rent',
      permanentRent: 'Long-term Rent',
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'House',
      land: 'Land',
      commercial: 'Commercial',
      office: 'Office',
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
      unavailable: 'Unavailable',
      sqm: 'sqm',
      rooms: 'Bedrooms',
      baths: 'Bathrooms',
      area: 'Area',
      propertyType: 'Property Type',
      listingType: 'Listing Type',
      status: 'Status',
      views: 'views',
      postedOn: 'Posted on',
      amenities: 'Amenities',
      ownerInfo: 'Owner Info',
      notFound: 'Property Not Found',
      notFoundDesc: 'The requested property could not be found',
      backToProperties: 'Back to Properties',
      copied: 'Copied',
      linkCopied: 'Link copied to clipboard',
      addedToFavorites: 'Added to favorites',
      removedFromFavorites: 'Removed from favorites',
      noDescription: 'No description available',
      noAmenities: 'No amenities specified',
    },
    fr: {
      back: 'Retour',
      propertyDetails: 'Détails de la Propriété',
      description: 'Description',
      features: 'Caractéristiques',
      location: 'Emplacement',
      contactOwner: 'Contacter le Propriétaire',
      call: 'Appeler',
      message: 'Message',
      share: 'Partager',
      favorite: 'Favoris',
      forSale: 'À Vendre',
      dailyRent: 'Location Journalière',
      monthlyRent: 'Location Mensuelle',
      permanentRent: 'Location Longue Durée',
      apartment: 'Appartement',
      villa: 'Villa',
      house: 'Maison',
      land: 'Terrain',
      commercial: 'Commercial',
      office: 'Bureau',
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
      unavailable: 'Non Disponible',
      sqm: 'm²',
      rooms: 'Chambres',
      baths: 'Salles de bain',
      area: 'Surface',
      propertyType: 'Type de Propriété',
      listingType: 'Type d\'Offre',
      status: 'Statut',
      views: 'vues',
      postedOn: 'Publié le',
      amenities: 'Équipements',
      ownerInfo: 'Info Propriétaire',
      notFound: 'Propriété Non Trouvée',
      notFoundDesc: 'La propriété demandée n\'a pas été trouvée',
      backToProperties: 'Retour aux Propriétés',
      copied: 'Copié',
      linkCopied: 'Lien copié dans le presse-papiers',
      addedToFavorites: 'Ajouté aux favoris',
      removedFromFavorites: 'Retiré des favoris',
      noDescription: 'Aucune description disponible',
      noAmenities: 'Aucun équipement spécifié',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProperty(data);
        // Increment views
        await supabase
          .from('properties')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id);
        
        // Fetch owner info
        const { data: ownerData } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('user_id', data.owner_id)
          .maybeSingle();
        
        if (ownerData) {
          setOwner(ownerData);
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  const getListingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: txt.forSale,
      daily_rent: txt.dailyRent,
      monthly_rent: txt.monthlyRent,
      permanent_rent: txt.permanentRent,
    };
    return labels[type] || type;
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      apartment: txt.apartment,
      villa: txt.villa,
      house: txt.house,
      land: txt.land,
      commercial: txt.commercial,
      office: txt.office,
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: txt.available,
      sold: txt.sold,
      rented: txt.rented,
      unavailable: txt.unavailable,
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500',
      sold: 'bg-red-500',
      rented: 'bg-blue-500',
      unavailable: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(txt.linkCopied);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleFavorite = async () => {
    if (property) {
      await toggleFavorite(property.id);
    }
  };

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <Building2 className="w-24 h-24 text-muted-foreground/30 mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{txt.notFound}</h1>
          <p className="text-muted-foreground mb-6">{txt.notFoundDesc}</p>
          <Button asChild>
            <Link to="/properties">
              <BackIcon className="w-4 h-4 me-2" />
              {txt.backToProperties}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <BackIcon className="w-4 h-4 me-2" />
              {txt.back}
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <section className="bg-muted">
          <div className="container mx-auto px-4 py-6">
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {property.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute start-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                        onClick={prevImage}
                      >
                        {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute end-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                        onClick={nextImage}
                      >
                        {dir === 'rtl' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </Button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 start-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Home className="w-24 h-24 text-muted-foreground/30" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 start-4 flex flex-wrap gap-2">
                <Badge className="bg-amber-500 text-slate-900 hover:bg-amber-600 text-sm px-3 py-1">
                  {getListingTypeLabel(property.listing_type)}
                </Badge>
                <Badge className={`${getStatusColor(property.status)} text-white text-sm px-3 py-1`}>
                  {getStatusLabel(property.status)}
                </Badge>
              </div>

              {/* Actions */}
              <div className="absolute top-4 end-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className={`bg-background/80 backdrop-blur-sm hover:bg-background ${property && isFavorite(property.id) ? 'text-red-500' : ''}`}
                  onClick={handleFavorite}
                >
                  <Heart className={`w-5 h-5 ${property && isFavorite(property.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {property.images && property.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-amber-500 ring-2 ring-amber-500/30' 
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Property Info */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title & Price */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-5 h-5" />
                        <span>
                          {property.address && `${property.address}, `}
                          {property.city}, {property.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-3xl md:text-4xl font-bold text-amber-500">
                    {formatPrice(property.price, property.currency)}
                    {property.listing_type !== 'sale' && (
                      <span className="text-lg text-muted-foreground font-normal">
                        {' / '}
                        {property.listing_type === 'daily_rent' 
                          ? (language === 'ar' ? 'يوم' : language === 'fr' ? 'jour' : 'day')
                          : (language === 'ar' ? 'شهر' : language === 'fr' ? 'mois' : 'month')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {property.bedrooms && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Bed className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{property.bedrooms}</p>
                            <p className="text-sm text-muted-foreground">{txt.rooms}</p>
                          </div>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Bath className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{property.bathrooms}</p>
                            <p className="text-sm text-muted-foreground">{txt.baths}</p>
                          </div>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Maximize className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{property.area}</p>
                            <p className="text-sm text-muted-foreground">{txt.sqm}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{property.views_count || 0}</p>
                          <p className="text-sm text-muted-foreground">{txt.views}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>{txt.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {property.description || txt.noDescription}
                    </p>
                  </CardContent>
                </Card>

                {/* Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>{txt.features}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">{txt.propertyType}</span>
                        <span className="font-medium text-foreground">{getPropertyTypeLabel(property.property_type)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">{txt.listingType}</span>
                        <span className="font-medium text-foreground">{getListingTypeLabel(property.listing_type)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">{txt.status}</span>
                        <span className="font-medium text-foreground">{getStatusLabel(property.status)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-border">
                        <span className="text-muted-foreground">{txt.postedOn}</span>
                        <span className="font-medium text-foreground">{formatDate(property.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{txt.amenities}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-foreground">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Map */}
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  address={property.address}
                  city={property.city}
                  country={property.country}
                />

                {/* Reviews */}
                <PropertyReviews propertyId={property.id} ownerId={property.owner_id} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Owner Card */}
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>{txt.contactOwner}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {owner && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center overflow-hidden">
                          {owner.avatar_url ? (
                            <img src={owner.avatar_url} alt={owner.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-bold text-amber-500">
                              {owner.full_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{owner.full_name}</p>
                          <p className="text-sm text-muted-foreground">{txt.ownerInfo}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {owner?.phone && (
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                          <a href={`tel:${owner.phone}`}>
                            <Phone className="w-4 h-4 me-2" />
                            {txt.call}
                          </a>
                        </Button>
                      )}
                      <SendMessageDialog
                        ownerId={property.owner_id}
                        ownerName={owner?.full_name || ''}
                        propertyId={property.id}
                        propertyTitle={property.title}
                      >
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="w-4 h-4 me-2" />
                          {txt.message}
                        </Button>
                      </SendMessageDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetailsPage;
