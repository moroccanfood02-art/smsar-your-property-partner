import React from 'react';
import { MapPin, Bed, Bath, Maximize, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Property {
  id: string;
  title: string;
  titleAr?: string;
  location: string;
  locationAr?: string;
  price: number;
  currency: string;
  type: 'sale' | 'daily' | 'monthly' | 'permanent';
  status: 'available' | 'sold' | 'rented' | 'not_available';
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  featured?: boolean;
  rating?: number;
}

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { t, dir, language } = useLanguage();

  const getStatusConfig = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return { label: t('available'), variant: 'default' as const, className: 'bg-success text-primary-foreground' };
      case 'sold':
        return { label: t('sold'), variant: 'secondary' as const, className: 'bg-destructive text-destructive-foreground' };
      case 'rented':
        return { label: t('rented'), variant: 'secondary' as const, className: 'bg-info text-primary-foreground' };
      case 'not_available':
        return { label: t('notAvailable'), variant: 'secondary' as const, className: 'bg-muted text-muted-foreground' };
    }
  };

  const getTypeLabel = (type: Property['type']): string => {
    switch (type) {
      case 'sale':
        return t('forSale');
      case 'daily':
        return t('dailyRent');
      case 'monthly':
        return t('monthlyRent');
      case 'permanent':
        return t('permanentRent');
    }
  };

  const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const statusConfig = getStatusConfig(property.status);
  const title = language === 'ar' && property.titleAr ? property.titleAr : property.title;
  const location = language === 'ar' && property.locationAr ? property.locationAr : property.location;

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top badges */}
        <div className="absolute top-4 start-4 end-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            {property.featured && (
              <Badge className="bg-gradient-gold text-navy-dark shadow-gold">
                <Star className="w-3 h-3 me-1" />
                {dir === 'rtl' ? 'مميز' : 'Featured'}
              </Badge>
            )}
          </div>
          <button className="w-10 h-10 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-card transition-all shadow-sm">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute bottom-4 start-4">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
            {getTypeLabel(property.type)}
          </Badge>
        </div>

        {/* Rating */}
        {property.rating && (
          <div className="absolute bottom-4 end-4 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-4 h-4 text-gold fill-gold" />
            <span className="text-sm font-medium text-foreground">{property.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Price */}
        <p className="text-2xl font-bold text-gold mb-2">
          {formatPrice(property.price, property.currency)}
          {property.type !== 'sale' && (
            <span className="text-sm font-normal text-muted-foreground">
              {property.type === 'daily' ? (dir === 'rtl' ? '/ليلة' : '/night') : (dir === 'rtl' ? '/شهر' : '/month')}
            </span>
          )}
        </p>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-gold transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms} {t('rooms')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4" />
            <span>{property.area} {t('sqm')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="gold" className="flex-1" size="sm">
            {t('viewDetails')}
          </Button>
          <Button variant="outline" size="sm">
            {t('contactOwner')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
