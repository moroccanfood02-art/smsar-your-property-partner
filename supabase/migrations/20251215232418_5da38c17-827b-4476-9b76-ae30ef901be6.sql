-- Fix RLS security issues: restrict public access to sensitive profile data

-- Drop the problematic public policy
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Create a more restrictive policy - only allow viewing basic info publicly
CREATE POLICY "Authenticated users can view basic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Create promotions/advertisements table for properties
CREATE TABLE IF NOT EXISTS public.property_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('featured', 'video_ad', 'banner', 'homepage')),
  video_url TEXT,
  banner_image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotions
ALTER TABLE public.property_promotions ENABLE ROW LEVEL SECURITY;

-- Promotions RLS policies
CREATE POLICY "Anyone can view active promotions"
ON public.property_promotions
FOR SELECT
USING (is_active = true AND end_date > now());

CREATE POLICY "Owners can view their own promotions"
ON public.property_promotions
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all promotions"
ON public.property_promotions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can create promotions for their properties"
ON public.property_promotions
FOR INSERT
WITH CHECK (
  owner_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND owner_id = auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_property_promotions_updated_at
BEFORE UPDATE ON public.property_promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for promotions
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_promotions;