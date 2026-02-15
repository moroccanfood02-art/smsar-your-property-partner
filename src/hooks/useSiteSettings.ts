import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  company_name: string;
  company_phone: string;
  company_email: string;
  company_city: string;
  company_city_en: string;
  company_city_fr: string;
  company_description_ar: string;
  company_description_en: string;
  company_description_fr: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
}

const defaults: SiteSettings = {
  company_name: 'SMSAR',
  company_phone: '+212 600 000 000',
  company_email: 'contact@smsar.ma',
  company_city: 'الدار البيضاء، المغرب',
  company_city_en: 'Casablanca, Morocco',
  company_city_fr: 'Casablanca, Maroc',
  company_description_ar: 'منصتك الموثوقة للعثور على عقارك المثالي في أي مكان في العالم.',
  company_description_en: 'Your trusted platform for finding your perfect property anywhere in the world.',
  company_description_fr: 'Votre plateforme de confiance pour trouver votre propriété idéale partout dans le monde.',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings' as any).select('key, value');
    if (data) {
      const mapped = { ...defaults };
      (data as any[]).forEach((row: { key: string; value: string }) => {
        if (row.key in mapped) {
          (mapped as any)[row.key] = row.value;
        }
      });
      setSettings(mapped);
    }
    setLoading(false);
  };

  const updateSetting = async (key: string, value: string) => {
    await supabase.from('site_settings' as any).update({ value, updated_at: new Date().toISOString() } as any).eq('key', key);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateMultiple = async (updates: Partial<SiteSettings>) => {
    for (const [key, value] of Object.entries(updates)) {
      await supabase.from('site_settings' as any).update({ value, updated_at: new Date().toISOString() } as any).eq('key', key);
    }
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, updateSetting, updateMultiple, refetch: fetchSettings };
};
