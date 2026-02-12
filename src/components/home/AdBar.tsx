import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { MapPin, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { PromotedProperty } from '@/hooks/usePromotions';

interface AdBarProps {
  ads: PromotedProperty[];
  rotationInterval?: number;
}

const AdBar: React.FC<AdBarProps> = ({ ads, rotationInterval = 5000 }) => {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const t = {
    ar: { featured: 'مميز', viewDetails: 'عرض', forSale: 'للبيع', dailyRent: 'يومي', monthlyRent: 'شهري', permanentRent: 'دائم' },
    en: { featured: 'Featured', viewDetails: 'View', forSale: 'Sale', dailyRent: 'Daily', monthlyRent: 'Monthly', permanentRent: 'Long-term' },
    fr: { featured: 'Vedette', viewDetails: 'Voir', forSale: 'Vente', dailyRent: 'Jour', monthlyRent: 'Mois', permanentRent: 'Long terme' },
    es: { featured: 'Destacado', viewDetails: 'Ver', forSale: 'Venta', dailyRent: 'Diario', monthlyRent: 'Mensual', permanentRent: 'Largo plazo' },
  };
  const text = t[language as keyof typeof t] || t.ar;

  const rotate = useCallback(() => {
    if (ads.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
      setIsTransitioning(false);
    }, 300);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(rotate, rotationInterval);
    return () => clearInterval(interval);
  }, [rotate, rotationInterval, ads.length]);

  if (!ads.length) return null;

  const ad = ads[currentIndex];
  if (!ad) return null;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-US', {
      style: 'currency', currency: currency || 'MAD', maximumFractionDigits: 0,
    }).format(price);
  };

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border-y border-amber-500/20 cursor-pointer group"
      onClick={() => navigate(`/property/${ad.property.id}`)}
    >
      <div className={`flex items-center gap-4 px-4 py-3 container mx-auto transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
          <img
            src={ad.banner_image_url || ad.property.images?.[0] || '/placeholder.svg'}
            alt={ad.property.title}
            className="w-full h-full object-cover"
          />
        </div>

        <Badge className="bg-amber-500 text-white flex-shrink-0" variant="default">
          <Sparkles className="w-3 h-3 mr-1" />
          {text.featured}
        </Badge>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="font-semibold text-foreground truncate text-sm">
            {ad.property.title}
          </span>
          <span className="text-muted-foreground text-xs flex items-center gap-1 flex-shrink-0 hidden md:flex">
            <MapPin className="w-3 h-3" />
            {ad.property.city}
          </span>
        </div>

        <span className="font-bold text-amber-600 dark:text-amber-400 flex-shrink-0 text-sm">
          {formatPrice(ad.property.price, ad.property.currency)}
        </span>

        <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors flex-shrink-0" />

        {/* Dot indicators */}
        {ads.length > 1 && (
          <div className="flex gap-1 flex-shrink-0">
            {ads.slice(0, Math.min(ads.length, 6)).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex % Math.min(ads.length, 6) ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBar;
