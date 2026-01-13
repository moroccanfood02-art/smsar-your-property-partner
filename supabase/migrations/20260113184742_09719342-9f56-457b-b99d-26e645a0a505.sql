-- Create storage bucket for promotion media (videos and banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('promotion-media', 'promotion-media', true, 52428800);

-- Allow authenticated users to upload their promotion media
CREATE POLICY "Users can upload promotion media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'promotion-media' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to promotion media
CREATE POLICY "Anyone can view promotion media"
ON storage.objects FOR SELECT
USING (bucket_id = 'promotion-media');

-- Allow users to update their own promotion media
CREATE POLICY "Users can update their promotion media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'promotion-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own promotion media
CREATE POLICY "Users can delete their promotion media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'promotion-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);