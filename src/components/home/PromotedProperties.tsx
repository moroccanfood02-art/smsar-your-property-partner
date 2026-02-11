import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, MapPin, Bed, Bath, Maximize, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<PromotedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
      permanentRent: 'كراء دائم',
      watchVideo: 'شاهد الفيديو',
      videoAds: 'إعلانات الفيديو',
      bannerAds: 'إعلانات البانر',
      featuredProperties: 'عقارات مميزة'
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
      permanentRent: 'Long-term Rent',
      watchVideo: 'Watch Video',
      videoAds: 'Video Ads',
      bannerAds: 'Banner Ads',
      featuredProperties: 'Featured Properties'
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
      permanentRent: 'Location Longue Durée',
      watchVideo: 'Voir la Vidéo',
      videoAds: 'Publicités Vidéo',
      bannerAds: 'Publicités Bannière',
      featuredProperties: 'Propriétés en Vedette'
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
      permanentRent: 'Alquiler a Largo Plazo',
      watchVideo: 'Ver Video',
      videoAds: 'Anuncios de Video',
      bannerAds: 'Anuncios de Banner',
      featuredProperties: 'Propiedades Destacadas'
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
        .limit(12);

      if (error) throw error;
      
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
      daily_rent: text.dailyRent,
      monthly_rent: text.monthlyRent,
      permanent_rent: text.permanentRent
    };
    return labels[type] || type;
  };

  const videoPromotions = promotions.filter(p => p.promotion_type === 'video_ad' && p.video_url);
  const bannerPromotions = promotions.filter(p => p.promotion_type === 'banner' && p.banner_image_url);
  const featuredPromotions = promotions.filter(p => p.promotion_type === 'featured');

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
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{text.title}</h2>
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-muted-foreground text-lg">{text.subtitle}</p>
        </div>

        {/* Video Ads Section */}
        {videoPromotions.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-purple-500" />
              {text.videoAds}
            </h3>
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                <video
                  key={videoPromotions[currentVideoIndex]?.video_url}
                  src={videoPromotions[currentVideoIndex]?.video_url || ''}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  muted
                  autoPlay
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  webkit-playsinline="true"
                />
                {/* Video overlay info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <Badge className="bg-purple-500 text-white mb-2">
                        <Play className="w-3 h-3 mr-1" /> {text.video}
                      </Badge>
                      <h4 className="text-white text-xl font-bold mb-1">
                        {videoPromotions[currentVideoIndex]?.property.title}
                      </h4>
                      <p className="text-white/80 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {videoPromotions[currentVideoIndex]?.property.city}, {videoPromotions[currentVideoIndex]?.property.country}
                      </p>
                      <p className="text-2xl font-bold text-amber-400 mt-2">
                        {formatPrice(videoPromotions[currentVideoIndex]?.property.price || 0, videoPromotions[currentVideoIndex]?.property.currency || 'MAD')}
                      </p>
                    </div>
                    <Button
                      variant="gold"
                      onClick={() => navigate(`/property/${videoPromotions[currentVideoIndex]?.property.id}`)}
                    >
                      {text.viewDetails}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Video navigation */}
              {videoPromotions.length > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 bg-black/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setCurrentVideoIndex(prev => prev === 0 ? videoPromotions.length - 1 : prev - 1)}
                  >
                    {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                  <div className="flex gap-2">
                    {videoPromotions.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          idx === currentVideoIndex ? 'bg-amber-500' : 'bg-white/30'
                        }`}
                        onClick={() => setCurrentVideoIndex(idx)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setCurrentVideoIndex(prev => prev === videoPromotions.length - 1 ? 0 : prev + 1)}
                  >
                    {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner Ads Section */}
        {bannerPromotions.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-500" />
              {text.bannerAds}
            </h3>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                direction: dir === 'rtl' ? 'rtl' : 'ltr',
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {bannerPromotions.map((promo) => (
                  <CarouselItem key={promo.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card 
                      className="group overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/property/${promo.property.id}`)}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={promo.banner_image_url || promo.property.images?.[0] || '/placeholder.svg'}
                          alt={promo.property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                          {text.banner}
                        </Badge>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h4 className="text-white font-bold truncate">{promo.property.title}</h4>
                          <p className="text-amber-400 font-bold">
                            {formatPrice(promo.property.price, promo.property.currency)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4" />
              <CarouselNext className="hidden md:flex -right-4" />
            </Carousel>
          </div>
        )}

        {/* Featured Properties Section */}
        {featuredPromotions.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              {text.featuredProperties}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPromotions.map((promo) => {
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
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className="bg-amber-500 text-white shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {text.featured}
                        </Badge>
                        <Badge variant="secondary" className="shadow">
                          {getListingTypeLabel(property.listing_type)}
                        </Badge>
                      </div>
                      
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
        )}
      </div>
    </section>
  );
};

export default PromotedProperties;
