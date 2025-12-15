import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/home/PropertyCard';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  title_ar?: string;
  location?: string;
  location_ar?: string;
  city: string;
  country: string;
  price: number;
  currency: string;
  property_type: string;
  listing_type: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  featured: boolean | null;
}

const FavoritesPage: React.FC = () => {
  const { language, dir } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const translations = {
    ar: {
      title: 'العقارات المفضلة',
      subtitle: 'قائمة العقارات التي أضفتها للمفضلة',
      noFavorites: 'لا توجد عقارات في المفضلة',
      noFavoritesDesc: 'ابدأ بإضافة عقارات للمفضلة لتظهر هنا',
      browseProperties: 'تصفح العقارات',
    },
    en: {
      title: 'Favorite Properties',
      subtitle: 'Properties you have added to favorites',
      noFavorites: 'No favorite properties',
      noFavoritesDesc: 'Start adding properties to favorites to see them here',
      browseProperties: 'Browse Properties',
    },
    fr: {
      title: 'Propriétés Favorites',
      subtitle: 'Propriétés que vous avez ajoutées aux favoris',
      noFavorites: 'Aucune propriété favorite',
      noFavoritesDesc: 'Commencez à ajouter des propriétés aux favoris pour les voir ici',
      browseProperties: 'Parcourir les Propriétés',
    },
  };

  const txt = translations[language];

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      // First get favorite property IDs
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (favorites && favorites.length > 0) {
        const propertyIds = favorites.map((f) => f.property_id);

        // Then fetch those properties
        const { data: props, error: propError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        if (propError) throw propError;
        setProperties(props || []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{txt.title}</h1>
            <p className="text-muted-foreground">{txt.subtitle}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-foreground mb-2">{txt.noFavorites}</h2>
              <p className="text-muted-foreground mb-6">{txt.noFavoritesDesc}</p>
              <Button asChild>
                <Link to="/properties">{txt.browseProperties}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.title,
                    titleAr: property.title,
                    location: `${property.city}, ${property.country}`,
                    locationAr: `${property.city}, ${property.country}`,
                    price: property.price,
                    currency: property.currency,
                    type: property.listing_type === 'sale' ? 'sale' : 
                          property.listing_type === 'daily_rent' ? 'daily' : 
                          property.listing_type === 'monthly_rent' ? 'monthly' : 'permanent',
                    status: property.status === 'available' ? 'available' : 
                            property.status === 'sold' ? 'sold' : 
                            property.status === 'rented' ? 'rented' : 'not_available',
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    area: property.area || 0,
                    image: property.images?.[0] || '/placeholder.svg',
                    featured: property.featured || false,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
