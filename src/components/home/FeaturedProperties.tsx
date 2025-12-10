import React from 'react';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { Property } from './PropertyCard';
import { useLanguage } from '@/contexts/LanguageContext';

// Sample data
const featuredProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa with Ocean View',
    titleAr: 'فيلا فاخرة بإطلالة على المحيط',
    location: 'Palm Jumeirah, Dubai',
    locationAr: 'نخلة جميرا، دبي',
    price: 2500000,
    currency: 'USD',
    type: 'sale',
    status: 'available',
    bedrooms: 5,
    bathrooms: 6,
    area: 850,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
    featured: true,
    rating: 4.9,
  },
  {
    id: '2',
    title: 'Modern Apartment in City Center',
    titleAr: 'شقة عصرية في وسط المدينة',
    location: 'Casablanca, Morocco',
    locationAr: 'الدار البيضاء، المغرب',
    price: 1200,
    currency: 'USD',
    type: 'monthly',
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    featured: true,
    rating: 4.7,
  },
  {
    id: '3',
    title: 'Beachfront Penthouse',
    titleAr: 'بنتهاوس على شاطئ البحر',
    location: 'Miami Beach, USA',
    locationAr: 'ميامي بيتش، أمريكا',
    price: 4500000,
    currency: 'USD',
    type: 'sale',
    status: 'available',
    bedrooms: 4,
    bathrooms: 4,
    area: 450,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
    featured: true,
    rating: 5.0,
  },
  {
    id: '4',
    title: 'Cozy Studio for Daily Rent',
    titleAr: 'استوديو مريح للكراء اليومي',
    location: 'Marrakech, Morocco',
    locationAr: 'مراكش، المغرب',
    price: 80,
    currency: 'USD',
    type: 'daily',
    status: 'available',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    featured: true,
    rating: 4.8,
  },
];

const FeaturedProperties: React.FC = () => {
  const { t, dir } = useLanguage();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">
                {dir === 'rtl' ? 'الأفضل لك' : 'Best for you'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-cairo">
              {t('featuredProperties')}
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {dir === 'rtl'
                ? 'اكتشف مجموعة مختارة من أفضل العقارات المميزة'
                : 'Discover a curated selection of our finest premium properties'}
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            {t('viewAll')}
            <ArrowIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
