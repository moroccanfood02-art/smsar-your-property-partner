import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Upload, X, MapPin, Home, DollarSign, Bed, Bath, 
  Maximize, Image as ImageIcon, Loader2, Plus, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const propertySchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
  property_type: z.string(),
  listing_type: z.string(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'السعر يجب أن يكون رقم صحيح'),
  currency: z.string(),
  area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  city: z.string().min(2, 'اختر المدينة'),
  address: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const AddPropertyPage: React.FC = () => {
  const { language, dir } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [mapLocation, setMapLocation] = useState({ lat: 33.5731, lng: -7.5898 }); // Casablanca default

  const translations = {
    ar: {
      addProperty: 'إضافة عقار جديد',
      basicInfo: 'المعلومات الأساسية',
      title: 'عنوان العقار',
      titlePlaceholder: 'مثال: شقة فاخرة في وسط المدينة',
      description: 'وصف العقار',
      descriptionPlaceholder: 'أدخل وصف تفصيلي للعقار...',
      propertyType: 'نوع العقار',
      listingType: 'نوع العرض',
      apartment: 'شقة',
      villa: 'فيلا',
      house: 'منزل',
      land: 'أرض',
      commercial: 'تجاري',
      office: 'مكتب',
      forSale: 'للبيع',
      dailyRent: 'كراء يومي',
      monthlyRent: 'كراء شهري',
      permanentRent: 'كراء دائم',
      priceDetails: 'تفاصيل السعر',
      price: 'السعر',
      currency: 'العملة',
      specifications: 'المواصفات',
      area: 'المساحة (م²)',
      bedrooms: 'غرف النوم',
      bathrooms: 'الحمامات',
      location: 'الموقع',
      city: 'المدينة',
      address: 'العنوان التفصيلي',
      addressPlaceholder: 'الحي، الشارع، رقم البناية...',
      mapPlaceholder: 'ستتم إضافة الخريطة قريباً - اختر الموقع على الخريطة',
      images: 'صور العقار',
      uploadImages: 'رفع الصور',
      dragDrop: 'اسحب وأفلت الصور هنا أو انقر للاختيار',
      maxImages: 'يمكنك رفع حتى 10 صور',
      amenities: 'المرافق والخدمات',
      wifi: 'واي فاي',
      parking: 'موقف سيارات',
      pool: 'مسبح',
      gym: 'صالة رياضية',
      garden: 'حديقة',
      security: 'حراسة أمنية',
      elevator: 'مصعد',
      ac: 'تكييف',
      heating: 'تدفئة',
      furnished: 'مفروش',
      balcony: 'شرفة',
      terrace: 'تراس',
      submit: 'نشر العقار',
      submitting: 'جاري النشر...',
      loginRequired: 'يجب تسجيل الدخول لإضافة عقار',
      ownerRequired: 'يجب أن تكون مالك لإضافة عقار',
      successMessage: 'تم إضافة العقار بنجاح!',
      errorMessage: 'حدث خطأ أثناء إضافة العقار',
    },
    en: {
      addProperty: 'Add New Property',
      basicInfo: 'Basic Information',
      title: 'Property Title',
      titlePlaceholder: 'Example: Luxury apartment in city center',
      description: 'Property Description',
      descriptionPlaceholder: 'Enter a detailed description of the property...',
      propertyType: 'Property Type',
      listingType: 'Listing Type',
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'House',
      land: 'Land',
      commercial: 'Commercial',
      office: 'Office',
      forSale: 'For Sale',
      dailyRent: 'Daily Rent',
      monthlyRent: 'Monthly Rent',
      permanentRent: 'Long-term Rent',
      priceDetails: 'Price Details',
      price: 'Price',
      currency: 'Currency',
      specifications: 'Specifications',
      area: 'Area (sqm)',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      location: 'Location',
      city: 'City',
      address: 'Detailed Address',
      addressPlaceholder: 'Neighborhood, street, building number...',
      mapPlaceholder: 'Map will be added soon - Select location on map',
      images: 'Property Images',
      uploadImages: 'Upload Images',
      dragDrop: 'Drag and drop images here or click to select',
      maxImages: 'You can upload up to 10 images',
      amenities: 'Amenities & Services',
      wifi: 'WiFi',
      parking: 'Parking',
      pool: 'Swimming Pool',
      gym: 'Gym',
      garden: 'Garden',
      security: 'Security',
      elevator: 'Elevator',
      ac: 'Air Conditioning',
      heating: 'Heating',
      furnished: 'Furnished',
      balcony: 'Balcony',
      terrace: 'Terrace',
      submit: 'Publish Property',
      submitting: 'Publishing...',
      loginRequired: 'You must be logged in to add a property',
      ownerRequired: 'You must be an owner to add a property',
      successMessage: 'Property added successfully!',
      errorMessage: 'An error occurred while adding the property',
    },
    fr: {
      addProperty: 'Ajouter une Propriété',
      basicInfo: 'Informations de Base',
      title: 'Titre de la Propriété',
      titlePlaceholder: 'Exemple: Appartement de luxe au centre-ville',
      description: 'Description de la Propriété',
      descriptionPlaceholder: 'Entrez une description détaillée de la propriété...',
      propertyType: 'Type de Propriété',
      listingType: 'Type d\'Annonce',
      apartment: 'Appartement',
      villa: 'Villa',
      house: 'Maison',
      land: 'Terrain',
      commercial: 'Commercial',
      office: 'Bureau',
      forSale: 'À Vendre',
      dailyRent: 'Location Journalière',
      monthlyRent: 'Location Mensuelle',
      permanentRent: 'Location Longue Durée',
      priceDetails: 'Détails du Prix',
      price: 'Prix',
      currency: 'Devise',
      specifications: 'Spécifications',
      area: 'Surface (m²)',
      bedrooms: 'Chambres',
      bathrooms: 'Salles de bain',
      location: 'Localisation',
      city: 'Ville',
      address: 'Adresse Détaillée',
      addressPlaceholder: 'Quartier, rue, numéro du bâtiment...',
      mapPlaceholder: 'La carte sera ajoutée bientôt - Sélectionnez l\'emplacement sur la carte',
      images: 'Images de la Propriété',
      uploadImages: 'Télécharger des Images',
      dragDrop: 'Glissez et déposez des images ici ou cliquez pour sélectionner',
      maxImages: 'Vous pouvez télécharger jusqu\'à 10 images',
      amenities: 'Équipements & Services',
      wifi: 'WiFi',
      parking: 'Parking',
      pool: 'Piscine',
      gym: 'Salle de Sport',
      garden: 'Jardin',
      security: 'Sécurité',
      elevator: 'Ascenseur',
      ac: 'Climatisation',
      heating: 'Chauffage',
      furnished: 'Meublé',
      balcony: 'Balcon',
      terrace: 'Terrasse',
      submit: 'Publier la Propriété',
      submitting: 'Publication...',
      loginRequired: 'Vous devez être connecté pour ajouter une propriété',
      ownerRequired: 'Vous devez être propriétaire pour ajouter une propriété',
      successMessage: 'Propriété ajoutée avec succès!',
      errorMessage: 'Une erreur s\'est produite lors de l\'ajout de la propriété',
    },
  };

  const txt = translations[language];

  const propertyTypes = [
    { value: 'apartment', label: txt.apartment },
    { value: 'villa', label: txt.villa },
    { value: 'house', label: txt.house },
    { value: 'land', label: txt.land },
    { value: 'commercial', label: txt.commercial },
    { value: 'office', label: txt.office },
  ];

  const listingTypes = [
    { value: 'sale', label: txt.forSale },
    { value: 'daily_rent', label: txt.dailyRent },
    { value: 'monthly_rent', label: txt.monthlyRent },
    { value: 'permanent_rent', label: txt.permanentRent },
  ];

  const cities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
    'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'El Jadida'
  ];

  const currencies = ['MAD', 'EUR', 'USD'];

  const amenitiesList = [
    { id: 'wifi', label: txt.wifi },
    { id: 'parking', label: txt.parking },
    { id: 'pool', label: txt.pool },
    { id: 'gym', label: txt.gym },
    { id: 'garden', label: txt.garden },
    { id: 'security', label: txt.security },
    { id: 'elevator', label: txt.elevator },
    { id: 'ac', label: txt.ac },
    { id: 'heating', label: txt.heating },
    { id: 'furnished', label: txt.furnished },
    { id: 'balcony', label: txt.balcony },
    { id: 'terrace', label: txt.terrace },
  ];

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'apartment',
      listing_type: 'sale',
      price: '',
      currency: 'MAD',
      area: '',
      bedrooms: '',
      bathrooms: '',
      city: '',
      address: '',
      amenities: [],
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast.error(txt.maxImages);
      return;
    }

    const newImages = [...images, ...files].slice(0, 10);
    setImages(newImages);

    // Create previews
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileName = `${user?.id}/${Date.now()}-${image.name}`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, image);

      if (!error) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!user) {
      toast.error(txt.loginRequired);
      navigate('/auth');
      return;
    }

    if (role !== 'owner' && role !== 'admin') {
      toast.error(txt.ownerRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Insert property
      const { error } = await supabase.from('properties').insert({
        owner_id: user.id,
        title: data.title,
        description: data.description,
        property_type: data.property_type as any,
        listing_type: data.listing_type as any,
        price: Number(data.price),
        currency: data.currency,
        area: data.area ? Number(data.area) : null,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : null,
        city: data.city,
        country: 'Morocco',
        address: data.address || null,
        images: imageUrls,
        amenities: selectedAmenities,
        latitude: mapLocation.lat,
        longitude: mapLocation.lng,
        status: 'available',
      });

      if (error) throw error;

      toast.success(txt.successMessage);
      navigate('/properties');
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error(txt.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is logged in and is owner
  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto mt-20">
              <CardContent className="pt-6 text-center">
                <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">{txt.loginRequired}</h2>
                <Button variant="gold" onClick={() => navigate('/auth')} className="mt-4">
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <main className="pt-20 pb-12">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center font-cairo">
              {txt.addProperty}
            </h1>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-amber-500" />
                      {txt.basicInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{txt.title}</FormLabel>
                          <FormControl>
                            <Input placeholder={txt.titlePlaceholder} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{txt.description}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={txt.descriptionPlaceholder} 
                              rows={5}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="property_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.propertyType}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {propertyTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="listing_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.listingType}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {listingTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Price Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-500" />
                      {txt.priceDetails}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.price}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.currency}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {currencies.map((curr) => (
                                  <SelectItem key={curr} value={curr}>
                                    {curr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Maximize className="w-5 h-5 text-amber-500" />
                      {txt.specifications}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.area}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.bedrooms}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.bathrooms}</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      {txt.location}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.city}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={txt.city} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{txt.address}</FormLabel>
                            <FormControl>
                              <Input placeholder={txt.addressPlaceholder} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Map Placeholder */}
                    <div className="relative h-64 bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
                        {/* Simple grid pattern */}
                        <div className="absolute inset-0 opacity-20">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={`h-${i}`}
                              className="absolute w-full h-px bg-slate-500"
                              style={{ top: `${i * 10}%` }}
                            />
                          ))}
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div
                              key={`v-${i}`}
                              className="absolute h-full w-px bg-slate-500"
                              style={{ left: `${i * 10}%` }}
                            />
                          ))}
                        </div>
                        
                        {/* Center marker */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="relative">
                            <MapPin className="w-10 h-10 text-amber-500 drop-shadow-lg" />
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-black/30 rounded-full blur-sm" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Placeholder text */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">{txt.mapPlaceholder}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-500" />
                      {txt.images}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-amber-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium mb-1">{txt.dragDrop}</p>
                        <p className="text-sm text-muted-foreground">{txt.maxImages}</p>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-amber-500" />
                      {txt.amenities}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {amenitiesList.map((amenity) => (
                        <button
                          key={amenity.id}
                          type="button"
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                            selectedAmenities.includes(amenity.id)
                              ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                              : 'border-border hover:border-amber-500/50'
                          }`}
                        >
                          {selectedAmenities.includes(amenity.id) && (
                            <Check className="w-4 h-4" />
                          )}
                          <span className="text-sm">{amenity.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin me-2" />
                      {txt.submitting}
                    </>
                  ) : (
                    txt.submit
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AddPropertyPage;
