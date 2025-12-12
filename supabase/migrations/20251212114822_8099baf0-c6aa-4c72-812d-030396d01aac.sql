-- Create property status enum
CREATE TYPE public.property_status AS ENUM ('available', 'sold', 'rented', 'unavailable');

-- Create property type enum
CREATE TYPE public.property_type AS ENUM ('apartment', 'villa', 'house', 'land', 'commercial', 'office');

-- Create listing type enum
CREATE TYPE public.listing_type AS ENUM ('sale', 'daily_rent', 'monthly_rent', 'permanent_rent');

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL DEFAULT 'apartment',
  listing_type listing_type NOT NULL DEFAULT 'sale',
  status property_status NOT NULL DEFAULT 'available',
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MAD',
  area DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  address TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Morocco',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Everyone can view available properties
CREATE POLICY "Anyone can view available properties"
ON public.properties
FOR SELECT
USING (status = 'available' OR owner_id = auth.uid());

-- Owners can insert their own properties
CREATE POLICY "Owners can insert their own properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() 
  AND public.has_role(auth.uid(), 'owner')
);

-- Owners can update their own properties
CREATE POLICY "Owners can update their own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- Owners can delete their own properties
CREATE POLICY "Owners can delete their own properties"
ON public.properties
FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_featured ON public.properties(featured) WHERE featured = true;