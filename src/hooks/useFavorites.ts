import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseFavoritesOptions {
  propertyId?: string;
  language?: 'ar' | 'en' | 'fr' | 'es';
}

const messages = {
  ar: {
    added: 'تمت الإضافة للمفضلة',
    removed: 'تمت الإزالة من المفضلة',
    loginRequired: 'يجب تسجيل الدخول',
  },
  en: {
    added: 'Added to favorites',
    removed: 'Removed from favorites',
    loginRequired: 'Please login first',
  },
  fr: {
    added: 'Ajouté aux favoris',
    removed: 'Retiré des favoris',
    loginRequired: 'Veuillez vous connecter',
  },
  es: {
    added: 'Añadido a favoritos',
    removed: 'Eliminado de favoritos',
    loginRequired: 'Por favor inicia sesión',
  },
};

export const useFavorites = (options: UseFavoritesOptions = {}) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const lang = options.language || 'ar';
  const txt = messages[lang];

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map((f) => f.property_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.includes(propertyId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) {
        toast.error(txt.loginRequired);
        return false;
      }

      const isCurrentlyFavorite = isFavorite(propertyId);

      try {
        if (isCurrentlyFavorite) {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', propertyId);

          if (error) throw error;
          setFavorites((prev) => prev.filter((id) => id !== propertyId));
          toast.success(txt.removed);
        } else {
          const { error } = await supabase.from('favorites').insert({
            user_id: user.id,
            property_id: propertyId,
          });

          if (error) throw error;
          setFavorites((prev) => [...prev, propertyId]);
          toast.success(txt.added);
        }

        return true;
      } catch (error) {
        console.error('Error toggling favorite:', error);
        return false;
      }
    },
    [user, isFavorite, txt]
  );

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
};
