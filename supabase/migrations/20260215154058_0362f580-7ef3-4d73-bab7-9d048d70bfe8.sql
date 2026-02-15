
-- Create site_settings table for company info
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (for footer)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default values
INSERT INTO public.site_settings (key, value) VALUES
  ('company_name', 'SMSAR'),
  ('company_phone', '+212 600 000 000'),
  ('company_email', 'contact@smsar.ma'),
  ('company_city', 'الدار البيضاء، المغرب'),
  ('company_city_en', 'Casablanca, Morocco'),
  ('company_city_fr', 'Casablanca, Maroc'),
  ('company_description_ar', 'منصتك الموثوقة للعثور على عقارك المثالي في أي مكان في العالم.'),
  ('company_description_en', 'Your trusted platform for finding your perfect property anywhere in the world.'),
  ('company_description_fr', 'Votre plateforme de confiance pour trouver votre propriété idéale partout dans le monde.'),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('instagram_url', ''),
  ('linkedin_url', '');
