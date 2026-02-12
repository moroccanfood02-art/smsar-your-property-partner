import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PromotedProperty {
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

export const usePromotions = (city?: string) => {
  const [promotions, setPromotions] = useState<PromotedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('property_promotions')
        .select(`
          id, property_id, promotion_type, video_url, banner_image_url,
          property:properties (
            id, title, price, city, country, images,
            bedrooms, bathrooms, area, listing_type, currency
          )
        `)
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const valid = (data || []).filter(p => p.property !== null) as unknown as PromotedProperty[];
      
      // Extract unique cities
      const uniqueCities = [...new Set(valid.map(p => p.property.city))].sort();
      setCities(uniqueCities);

      // Filter by city if selected
      const filtered = city && city !== 'all' 
        ? valid.filter(p => p.property.city === city)
        : valid;

      setPromotions(filtered);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const videoAds = promotions.filter(p => p.promotion_type === 'video_ad' && p.video_url);
  const bannerAds = promotions.filter(p => p.promotion_type === 'banner' && p.banner_image_url);
  const featuredAds = promotions.filter(p => p.promotion_type === 'featured');

  return { promotions, videoAds, bannerAds, featuredAds, cities, loading, refetch: fetchPromotions };
};
