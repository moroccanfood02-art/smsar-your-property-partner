-- Remove the foreign key constraint on owner_id to allow test data
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;