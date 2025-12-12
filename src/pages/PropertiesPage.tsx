import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Maximize, Filter, Grid, List, Home, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
  city: string;
  country: string;
  images: string[];
  featured: boolean;
}

const PropertiesPage: React.FC = () => {
  const { language, dir } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [city, setCity] = useState<string>('all');

  const translations = {
    ar: {
      properties: 'العقارات',
      searchPlaceholder: 'ابحث عن عقار...',
      allListingTypes: 'جميع الأنواع',
      forSale: 'للبيع',
      dailyRent: 'كراء يومي',
      monthlyRent: 'كراء شهري',
      permanentRent: 'كراء دائم',
      allPropertyTypes: 'جميع العقارات',
      apartment: 'شقة',
      villa: 'فيلا',
      house: 'منزل',
      land: 'أرض',
      commercial: 'تجاري',
      office: 'مكتب',
      allCities: 'جميع المدن',
      noProperties: 'لا توجد عقارات متاحة',
      noPropertiesDesc: 'لم يتم العثور على عقارات تطابق معايير البحث',
      sqm: 'م²',
      rooms: 'غرف',
      baths: 'حمام',
      viewDetails: 'عرض التفاصيل',
      featured: 'مميز',
      available: 'متاح',
      sold: 'تم البيع',
      rented: 'تم الكراء',
      filters: 'الفلاتر',
      results: 'نتيجة',
    },
    en: {
      properties: 'Properties',
      searchPlaceholder: 'Search for a property...',
      allListingTypes: 'All Types',
      forSale: 'For Sale',
      dailyRent: 'Daily Rent',
      monthlyRent: 'Monthly Rent',
      permanentRent: 'Long-term Rent',
      allPropertyTypes: 'All Properties',
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'House',
      land: 'Land',
      commercial: 'Commercial',
      office: 'Office',
      allCities: 'All Cities',
      noProperties: 'No properties available',
      noPropertiesDesc: 'No properties match your search criteria',
      sqm: 'sqm',
      rooms: 'rooms',
      baths: 'baths',
      viewDetails: 'View Details',
      featured: 'Featured',
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
      filters: 'Filters',
      results: 'results',
    },
    fr: {
      properties: 'Propriétés',
      searchPlaceholder: 'Rechercher une propriété...',
      allListingTypes: 'Tous les Types',
      forSale: 'À Vendre',
      dailyRent: 'Location Journalière',
      monthlyRent: 'Location Mensuelle',
      permanentRent: 'Location Longue Durée',
      allPropertyTypes: 'Toutes les Propriétés',
      apartment: 'Appartement',
      villa: 'Villa',
      house: 'Maison',
      land: 'Terrain',
      commercial: 'Commercial',
      office: 'Bureau',
      allCities: 'Toutes les Villes',
      noProperties: 'Aucune propriété disponible',
      noPropertiesDesc: 'Aucune propriété ne correspond à vos critères',
      sqm: 'm²',
      rooms: 'pièces',
      baths: 'sdb',
      viewDetails: 'Voir Détails',
      featured: 'En Vedette',
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
      filters: 'Filtres',
      results: 'résultats',
    },
  };

  const txt = translations[language];

  const listingTypes = [
    { value: 'all', label: txt.allListingTypes },
    { value: 'sale', label: txt.forSale },
    { value: 'daily_rent', label: txt.dailyRent },
    { value: 'monthly_rent', label: txt.monthlyRent },
    { value: 'permanent_rent', label: txt.permanentRent },
  ];

  const propertyTypes = [
    { value: 'all', label: txt.allPropertyTypes },
    { value: 'apartment', label: txt.apartment },
    { value: 'villa', label: txt.villa },
    { value: 'house', label: txt.house },
    { value: 'land', label: txt.land },
    { value: 'commercial', label: txt.commercial },
    { value: 'office', label: txt.office },
  ];

  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir'];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesListingType = listingType === 'all' || property.listing_type === listingType;
    const matchesPropertyType = propertyType === 'all' || property.property_type === propertyType;
    const matchesCity = city === 'all' || property.city === city;

    return matchesSearch && matchesListingType && matchesPropertyType && matchesCity;
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
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
    };
    return labels[status] || status;
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Home className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-wrap gap-2">
          <Badge className="bg-amber-500 text-slate-900 hover:bg-amber-600">
            {getListingTypeLabel(property.listing_type)}
          </Badge>
          {property.featured && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {txt.featured}
            </Badge>
          )}
        </div>
        
        {/* Price */}
        <div className="absolute bottom-3 start-3">
          <span className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg font-bold text-foreground">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors">
            {property.title}
          </h3>
          <Badge variant="outline" className="shrink-0">
            {getPropertyTypeLabel(property.property_type)}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{property.city}, {property.country}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} {txt.rooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} {txt.baths}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              <span>{property.area} {txt.sqm}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 font-cairo">
              {txt.properties}
            </h1>
            <p className="text-white/70 text-center max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'اكتشف أفضل العقارات المتاحة للبيع والكراء' 
                : language === 'fr' 
                  ? 'Découvrez les meilleures propriétés disponibles' 
                  : 'Discover the best properties available for sale and rent'}
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-6 bg-card border-b border-border/50 sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={txt.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={txt.allCities} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{txt.allCities}</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredProperties.length} {txt.results}
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{txt.noProperties}</h3>
                <p className="text-muted-foreground">{txt.noPropertiesDesc}</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredProperties.map((property) => (
                  <Link key={property.id} to={`/property/${property.id}`}>
                    <PropertyCard property={property} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertiesPage;
