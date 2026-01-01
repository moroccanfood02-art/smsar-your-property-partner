import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, MapPin, Bed, Bath, Maximize } from 'lucide-react';

interface PromotedProperty {
  id: string;
  property_id: string;
  promotion_type: string;
  video_url: string | null;
  banner_image_url: string | null;
  property: {
    id: string;
    title: string;
    price: number;
    city: string;
    country: string;
    images: string[];
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
    listing_type: string;
    currency: string;
  };
}

const PromotedProperties: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'عقارات مميزة',
      subtitle: 'أفضل العقارات المختارة لك',
      viewDetails: 'عرض التفاصيل',
      featured: 'مميز',
      video: 'فيديو',
      banner: 'بانر',
      sqm: 'م²',
      forSale: 'للبيع',
      dailyRent: 'كراء يومي',
      monthlyRent: 'كراء شهري',
      permanentRent: 'كراء دائم'
    },
    en: {
      title: 'Promoted Properties',
      subtitle: 'Best properties selected for you',
      viewDetails: 'View Details',
      featured: 'Featured',
      video: 'Video',
      banner: 'Banner',
      sqm: 'sqm',
      forSale: 'For Sale',
      dailyRent: 'Daily Rent',
      monthlyRent: 'Monthly Rent',
      permanentRent: 'Long-term Rent'
    },
    fr: {
      title: 'Propriétés Promues',
      subtitle: 'Les meilleures propriétés sélectionnées pour vous',
      viewDetails: 'Voir Détails',
      featured: 'En vedette',
      video: 'Vidéo',
      banner: 'Bannière',
      sqm: 'm²',
      forSale: 'À Vendre',
      dailyRent: 'Location Journalière',
      monthlyRent: 'Location Mensuelle',
      permanentRent: 'Location Longue Durée'
    },
    es: {
      title: 'Propiedades Promocionadas',
      subtitle: 'Las mejores propiedades seleccionadas para ti',
      viewDetails: 'Ver Detalles',
      featured: 'Destacado',
      video: 'Video',
      banner: 'Banner',
      sqm: 'm²',
      forSale: 'En Venta',
      dailyRent: 'Alquiler Diario',
      monthlyRent: 'Alquiler Mensual',
      permanentRent: 'Alquiler a Largo Plazo'
    }
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('property_promotions')
        .select(`
          id,
          property_id,
          promotion_type,
          video_url,
          banner_image_url,
          property:properties (
            id,
            title,
            price,
            city,
            country,
            images,
            bedrooms,
            bathrooms,
            area,
            listing_type,
            currency
          )
        `)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Filter out any null properties and type cast
      const validPromotions = (data || []).filter(p => p.property !== null) as unknown as PromotedProperty[];
      setPromotions(validPromotions);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-US', {
      style: 'currency',
      currency: currency || 'MAD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getListingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sale: text.forSale,
      daily: text.dailyRent,
      monthly: text.monthlyRent,
      permanent: text.permanentRent
    };
    return labels[type] || type;
  };

  const getPromotionBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      featured: { label: text.featured, className: 'bg-amber-500' },
      video: { label: text.video, className: 'bg-purple-500' },
      banner: { label: text.banner, className: 'bg-blue-500' }
    };
    return badges[type] || badges.featured;
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">{text.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{text.title}</h2>
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-muted-foreground text-lg">{text.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const badge = getPromotionBadge(promo.promotion_type);
            const property = promo.property;
            
            return (
              <Card 
                key={promo.id} 
                className="group overflow-hidden border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div className="relative h-56 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className={`${badge.className} text-white shadow-lg`}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      {badge.label}
                    </Badge>
                    <Badge variant="secondary" className="shadow">
                      {getListingTypeLabel(property.listing_type)}
                    </Badge>
                  </div>
                  
                  {/* Video indicator */}
                  {promo.video_url && (
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/70 rounded-full p-2">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {/* Price overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-2xl font-bold text-white">
                      {formatPrice(property.price, property.currency)}
                    </p>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">{property.city}, {property.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        <span>{property.area} {text.sqm}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    {text.viewDetails}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromotedProperties;
