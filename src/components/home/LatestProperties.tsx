import React from 'react';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyCard, { Property } from './PropertyCard';
import { useLanguage } from '@/contexts/LanguageContext';

// Sample data
const latestProperties: Property[] = [
  {
    id: '5',
    title: 'Charming Townhouse',
    titleAr: 'تاون هاوس ساحر',
    location: 'London, UK',
    locationAr: 'لندن، المملكة المتحدة',
    price: 850000,
    currency: 'GBP',
    type: 'sale',
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
    rating: 4.6,
  },
  {
    id: '6',
    title: 'Elegant Parisian Flat',
    titleAr: 'شقة باريسية أنيقة',
    location: 'Paris, France',
    locationAr: 'باريس، فرنسا',
    price: 3500,
    currency: 'EUR',
    type: 'monthly',
    status: 'available',
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=60',
    rating: 4.8,
  },
  {
    id: '7',
    title: 'Modern Loft Space',
    titleAr: 'لوفت عصري',
    location: 'Toronto, Canada',
    locationAr: 'تورنتو، كندا',
    price: 650000,
    currency: 'CAD',
    type: 'sale',
    status: 'sold',
    bedrooms: 1,
    bathrooms: 1,
    area: 75,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=60',
    rating: 4.5,
  },
  {
    id: '8',
    title: 'Seafront Villa',
    titleAr: 'فيلا على الواجهة البحرية',
    location: 'Tangier, Morocco',
    locationAr: 'طنجة، المغرب',
    price: 450000,
    currency: 'USD',
    type: 'sale',
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
    rating: 4.9,
  },
  {
    id: '9',
    title: 'Downtown Executive Suite',
    titleAr: 'جناح تنفيذي وسط المدينة',
    location: 'Nairobi, Kenya',
    locationAr: 'نيروبي، كينيا',
    price: 150,
    currency: 'USD',
    type: 'daily',
    status: 'available',
    bedrooms: 2,
    bathrooms: 2,
    area: 95,
    image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&auto=format&fit=crop&q=60',
    rating: 4.7,
  },
  {
    id: '10',
    title: 'Historic Riad',
    titleAr: 'رياض تاريخي',
    location: 'Fes, Morocco',
    locationAr: 'فاس، المغرب',
    price: 2000,
    currency: 'USD',
    type: 'permanent',
    status: 'rented',
    bedrooms: 5,
    bathrooms: 4,
    area: 400,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=60',
    rating: 4.9,
  },
];

const LatestProperties: React.FC = () => {
  const { t, dir } = useLanguage();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">
                {dir === 'rtl' ? 'جديد' : 'New'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-cairo">
              {t('latestProperties')}
            </h2>
            <p className="text-muted-foreground max-w-xl">
              {dir === 'rtl'
                ? 'تصفح أحدث العقارات المضافة على منصتنا'
                : 'Browse the newest properties added to our platform'}
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            {t('viewAll')}
            <ArrowIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {latestProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestProperties;
