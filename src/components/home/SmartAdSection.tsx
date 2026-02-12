import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePromotions } from '@/hooks/usePromotions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, MapPin, Bed, Bath, Maximize, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 6;
const VIDEO_ROTATION_INTERVAL = 8000;

const SmartAdSection: React.FC = () => {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const { videoAds, bannerAds, featuredAds, cities, loading } = usePromotions(selectedCity);

  // Video rotation
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  // Banner rotation (show 3 at a time, rotate)
  const [bannerPage, setBannerPage] = useState(0);
  // Featured pagination
  const [featuredPage, setFeaturedPage] = useState(0);

  // Auto-rotate video
  useEffect(() => {
    if (videoAds.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentVideoIdx(prev => (prev + 1) % videoAds.length);
    }, VIDEO_ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [videoAds.length]);

  // Auto-rotate banners
  useEffect(() => {
    if (bannerAds.length <= 3) return;
    const timer = setInterval(() => {
      setBannerPage(prev => {
        const maxPage = Math.ceil(bannerAds.length / 3) - 1;
        return prev >= maxPage ? 0 : prev + 1;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerAds.length]);

  // Reset indexes on city change
  useEffect(() => {
    setCurrentVideoIdx(0);
    setBannerPage(0);
    setFeaturedPage(0);
  }, [selectedCity]);

  const t = {
    ar: { title: 'عقارات مميزة', subtitle: 'أفضل العقارات المختارة لك', viewDetails: 'عرض التفاصيل', featured: 'مميز', video: 'فيديو', banner: 'بانر', sqm: 'م²', forSale: 'للبيع', dailyRent: 'كراء يومي', monthlyRent: 'كراء شهري', permanentRent: 'كراء دائم', videoAds: 'إعلانات الفيديو', bannerAds: 'إعلانات البانر', featuredProperties: 'عقارات مميزة', allCities: 'جميع المدن', filterByCity: 'فلتر حسب المدينة', next: 'التالي', prev: 'السابق', noAds: 'لا توجد إعلانات', showMore: 'المزيد' },
    en: { title: 'Promoted Properties', subtitle: 'Best properties selected for you', viewDetails: 'View Details', featured: 'Featured', video: 'Video', banner: 'Banner', sqm: 'sqm', forSale: 'For Sale', dailyRent: 'Daily Rent', monthlyRent: 'Monthly Rent', permanentRent: 'Long-term Rent', videoAds: 'Video Ads', bannerAds: 'Banner Ads', featuredProperties: 'Featured Properties', allCities: 'All Cities', filterByCity: 'Filter by City', next: 'Next', prev: 'Previous', noAds: 'No ads available', showMore: 'Show More' },
    fr: { title: 'Propriétés Promues', subtitle: 'Les meilleures propriétés sélectionnées', viewDetails: 'Voir Détails', featured: 'En vedette', video: 'Vidéo', banner: 'Bannière', sqm: 'm²', forSale: 'À Vendre', dailyRent: 'Jour', monthlyRent: 'Mois', permanentRent: 'Long Durée', videoAds: 'Publicités Vidéo', bannerAds: 'Publicités Bannière', featuredProperties: 'Propriétés en Vedette', allCities: 'Toutes les villes', filterByCity: 'Filtrer par ville', next: 'Suivant', prev: 'Précédent', noAds: 'Aucune annonce', showMore: 'Plus' },
    es: { title: 'Propiedades Promocionadas', subtitle: 'Las mejores propiedades', viewDetails: 'Ver Detalles', featured: 'Destacado', video: 'Video', banner: 'Banner', sqm: 'm²', forSale: 'Venta', dailyRent: 'Diario', monthlyRent: 'Mensual', permanentRent: 'Largo Plazo', videoAds: 'Anuncios Video', bannerAds: 'Anuncios Banner', featuredProperties: 'Propiedades Destacadas', allCities: 'Todas las ciudades', filterByCity: 'Filtrar por ciudad', next: 'Siguiente', prev: 'Anterior', noAds: 'Sin anuncios', showMore: 'Más' },
  };
  const text = t[language as keyof typeof t] || t.ar;

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-US', { style: 'currency', currency: currency || 'MAD', maximumFractionDigits: 0 }).format(price);

  const getListingLabel = (type: string) => {
    const m: Record<string, string> = { sale: text.forSale, daily_rent: text.dailyRent, monthly_rent: text.monthlyRent, permanent_rent: text.permanentRent };
    return m[type] || type;
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-3xl font-bold text-foreground">{text.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4"><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const totalAds = videoAds.length + bannerAds.length + featuredAds.length;
  if (totalAds === 0) return null;

  const visibleBanners = bannerAds.slice(bannerPage * 3, bannerPage * 3 + 3);
  const totalBannerPages = Math.ceil(bannerAds.length / 3);

  const visibleFeatured = featuredAds.slice(featuredPage * ITEMS_PER_PAGE, featuredPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);
  const totalFeaturedPages = Math.ceil(featuredAds.length / ITEMS_PER_PAGE);

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header with city filter */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{text.title}</h2>
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-muted-foreground text-lg mb-6">{text.subtitle}</p>

          {/* City Filter */}
          {cities.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Button
                size="sm"
                variant={selectedCity === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCity('all')}
                className="rounded-full"
              >
                {text.allCities}
              </Button>
              {cities.map(city => (
                <Button
                  key={city}
                  size="sm"
                  variant={selectedCity === city ? 'default' : 'outline'}
                  onClick={() => setSelectedCity(city)}
                  className="rounded-full"
                >
                  {city}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Video Ads - one at a time, auto-rotating */}
        {videoAds.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-purple-500" />
              {text.videoAds}
              <Badge variant="secondary" className="text-xs">{videoAds.length}</Badge>
            </h3>
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                <video
                  key={videoAds[currentVideoIdx]?.video_url}
                  src={videoAds[currentVideoIdx]?.video_url || ''}
                  className="w-full h-full object-cover"
                  controls playsInline muted autoPlay preload="metadata"
                  webkit-playsinline="true"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <Badge className="bg-purple-500 text-white mb-2"><Play className="w-3 h-3 mr-1" />{text.video}</Badge>
                      <h4 className="text-white text-xl font-bold mb-1">{videoAds[currentVideoIdx]?.property.title}</h4>
                      <p className="text-white/80 flex items-center gap-1"><MapPin className="w-4 h-4" />{videoAds[currentVideoIdx]?.property.city}, {videoAds[currentVideoIdx]?.property.country}</p>
                      <p className="text-2xl font-bold text-amber-400 mt-2">{formatPrice(videoAds[currentVideoIdx]?.property.price || 0, videoAds[currentVideoIdx]?.property.currency || 'MAD')}</p>
                    </div>
                    <Button variant="gold" onClick={() => navigate(`/property/${videoAds[currentVideoIdx]?.property.id}`)}>{text.viewDetails}</Button>
                  </div>
                </div>
              </div>
              {videoAds.length > 1 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-black/50">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setCurrentVideoIdx(prev => prev === 0 ? videoAds.length - 1 : prev - 1)}>
                    {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                  <div className="flex gap-1.5">
                    {videoAds.map((_, i) => (
                      <button key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentVideoIdx ? 'bg-amber-500' : 'bg-white/30'}`} onClick={() => setCurrentVideoIdx(i)} />
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setCurrentVideoIdx(prev => prev === videoAds.length - 1 ? 0 : prev + 1)}>
                    {dir === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner Ads - rotating 3 at a time */}
        {bannerAds.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-500" />
                {text.bannerAds}
                <Badge variant="secondary" className="text-xs">{bannerAds.length}</Badge>
              </h3>
              {totalBannerPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBannerPage(p => p === 0 ? totalBannerPages - 1 : p - 1)}>
                    {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">{bannerPage + 1}/{totalBannerPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setBannerPage(p => p >= totalBannerPages - 1 ? 0 : p + 1)}>
                    {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleBanners.map(promo => (
                <Card key={promo.id} className="group overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/property/${promo.property.id}`)}>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={promo.banner_image_url || promo.property.images?.[0] || '/placeholder.svg'} alt={promo.property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <Badge className="absolute top-3 left-3 bg-blue-500 text-white">{text.banner}</Badge>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h4 className="text-white font-bold truncate">{promo.property.title}</h4>
                      <p className="text-amber-400 font-bold">{formatPrice(promo.property.price, promo.property.currency)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Featured - paginated */}
        {featuredAds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                {text.featuredProperties}
                <Badge variant="secondary" className="text-xs">{featuredAds.length}</Badge>
              </h3>
              {totalFeaturedPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setFeaturedPage(p => p === 0 ? totalFeaturedPages - 1 : p - 1)}>
                    {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">{featuredPage + 1}/{totalFeaturedPages}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setFeaturedPage(p => p >= totalFeaturedPages - 1 ? 0 : p + 1)}>
                    {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleFeatured.map(promo => {
                const p = promo.property;
                return (
                  <Card key={promo.id} className="group overflow-hidden border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
                    <div className="relative h-56 overflow-hidden">
                      {p.images?.length ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center"><MapPin className="w-12 h-12 text-muted-foreground" /></div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <Badge className="bg-amber-500 text-white shadow-lg"><Sparkles className="w-3 h-3 mr-1" />{text.featured}</Badge>
                        <Badge variant="secondary" className="shadow">{getListingLabel(p.listing_type)}</Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-2xl font-bold text-white">{formatPrice(p.price, p.currency)}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{p.city}, {p.country}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {p.bedrooms && <div className="flex items-center gap-1"><Bed className="w-4 h-4" /><span>{p.bedrooms}</span></div>}
                        {p.bathrooms && <div className="flex items-center gap-1"><Bath className="w-4 h-4" /><span>{p.bathrooms}</span></div>}
                        {p.area && <div className="flex items-center gap-1"><Maximize className="w-4 h-4" /><span>{p.area} {text.sqm}</span></div>}
                      </div>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white" onClick={() => navigate(`/property/${p.id}`)}>{text.viewDetails}</Button>
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

export default SmartAdSection;
