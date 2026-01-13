import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Megaphone, Star, Video, Image, Loader2, Upload, X } from 'lucide-react';

interface PromotePropertyDialogProps {
  propertyId: string;
  propertyTitle: string;
  children: React.ReactNode;
}

const PromotePropertyDialog = ({
  propertyId,
  propertyTitle,
  children,
}: PromotePropertyDialogProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('featured_7');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const t = {
    ar: {
      title: 'ترويج العقار',
      description: 'اختر نوع الإعلان لترويج عقارك',
      featured: 'عقار مميز',
      featuredDesc: 'يظهر في قسم العقارات المميزة لمدة 7 أيام',
      featuredPrice: '99 درهم',
      video: 'إعلان فيديو',
      videoDesc: 'إعلان فيديو في الصفحة الرئيسية لمدة 14 يوم',
      videoPrice: '199 درهم',
      banner: 'بانر إعلاني',
      bannerDesc: 'بانر كبير في أعلى الصفحة الرئيسية لمدة 30 يوم',
      bannerPrice: '499 درهم',
      promote: 'ترويج الآن',
      popular: 'الأكثر شعبية',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
      uploadVideo: 'رفع الفيديو',
      uploadBanner: 'رفع صورة البانر',
      videoRequired: 'يرجى رفع الفيديو',
      bannerRequired: 'يرجى رفع صورة البانر',
      maxSize: 'الحد الأقصى: 50 ميجابايت',
      uploading: 'جاري الرفع...',
    },
    en: {
      title: 'Promote Property',
      description: 'Choose an ad type to promote your property',
      featured: 'Featured Property',
      featuredDesc: 'Appears in featured section for 7 days',
      featuredPrice: '99 MAD',
      video: 'Video Ad',
      videoDesc: 'Video ad on homepage for 14 days',
      videoPrice: '199 MAD',
      banner: 'Banner Ad',
      bannerDesc: 'Large banner on homepage for 30 days',
      bannerPrice: '499 MAD',
      promote: 'Promote Now',
      popular: 'Most Popular',
      error: 'An error occurred, please try again',
      uploadVideo: 'Upload Video',
      uploadBanner: 'Upload Banner Image',
      videoRequired: 'Please upload a video',
      bannerRequired: 'Please upload a banner image',
      maxSize: 'Max size: 50MB',
      uploading: 'Uploading...',
    },
    fr: {
      title: 'Promouvoir la propriété',
      description: 'Choisissez un type de publicité pour promouvoir votre propriété',
      featured: 'Propriété en vedette',
      featuredDesc: 'Apparaît dans la section vedette pendant 7 jours',
      featuredPrice: '99 MAD',
      video: 'Publicité vidéo',
      videoDesc: 'Publicité vidéo sur la page d\'accueil pendant 14 jours',
      videoPrice: '199 MAD',
      banner: 'Bannière publicitaire',
      bannerDesc: 'Grande bannière sur la page d\'accueil pendant 30 jours',
      bannerPrice: '499 MAD',
      promote: 'Promouvoir maintenant',
      popular: 'Plus populaire',
      error: 'Une erreur s\'est produite, veuillez réessayer',
      uploadVideo: 'Télécharger la vidéo',
      uploadBanner: 'Télécharger l\'image de la bannière',
      videoRequired: 'Veuillez télécharger une vidéo',
      bannerRequired: 'Veuillez télécharger une image de bannière',
      maxSize: 'Taille max: 50 Mo',
      uploading: 'Téléchargement...',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const promotionTypes = [
    {
      id: 'featured_7',
      icon: Star,
      title: text.featured,
      description: text.featuredDesc,
      price: text.featuredPrice,
      popular: false,
      requiresMedia: false,
    },
    {
      id: 'video_14',
      icon: Video,
      title: text.video,
      description: text.videoDesc,
      price: text.videoPrice,
      popular: true,
      requiresMedia: 'video',
    },
    {
      id: 'banner_30',
      icon: Image,
      title: text.banner,
      description: text.bannerDesc,
      price: text.bannerPrice,
      popular: false,
      requiresMedia: 'banner',
    },
  ];

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'banner'): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${propertyId}_${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('promotion-media')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('promotion-media')
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  };

  const handlePromote = async () => {
    const selectedPromotion = promotionTypes.find(p => p.id === selectedType);
    
    // Validate media files
    if (selectedPromotion?.requiresMedia === 'video' && !videoFile) {
      toast({ title: text.videoRequired, variant: 'destructive' });
      return;
    }
    if (selectedPromotion?.requiresMedia === 'banner' && !bannerFile) {
      toast({ title: text.bannerRequired, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      let videoUrl = '';
      let bannerImageUrl = '';

      // Upload files if needed
      if (videoFile && selectedType === 'video_14') {
        setUploading(true);
        videoUrl = await uploadFile(videoFile, 'video');
      }
      if (bannerFile && selectedType === 'banner_30') {
        setUploading(true);
        bannerImageUrl = await uploadFile(bannerFile, 'banner');
      }
      setUploading(false);

      const { data, error } = await supabase.functions.invoke('create-promotion-checkout', {
        body: {
          propertyId,
          promotionType: selectedType,
          videoUrl,
          bannerImageUrl,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        setOpen(false);
        // Reset state
        setVideoFile(null);
        setBannerFile(null);
        setVideoPreview('');
        setBannerPreview('');
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast({
        title: text.error,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const selectedPromotion = promotionTypes.find(p => p.id === selectedType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {text.title}
          </DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
            {propertyTitle}
          </p>

          <RadioGroup
            value={selectedType}
            onValueChange={setSelectedType}
            className="space-y-3"
          >
            {promotionTypes.map((type) => (
              <div
                key={type.id}
                className={`relative flex items-start space-x-3 rtl:space-x-reverse rounded-lg border p-4 cursor-pointer transition-colors ${
                  selectedType === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={type.id} className="flex items-center gap-2 cursor-pointer">
                    <type.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{type.title}</span>
                    {type.popular && (
                      <Badge variant="secondary" className="text-xs">
                        {text.popular}
                      </Badge>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
                <span className="font-bold text-primary">{type.price}</span>
              </div>
            ))}
          </RadioGroup>

          {/* Video Upload */}
          {selectedType === 'video_14' && (
            <div className="mt-4 space-y-2">
              <Label>{text.uploadVideo}</Label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              {videoPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <video src={videoPreview} className="w-full h-40 object-cover" controls />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{text.uploadVideo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{text.maxSize}</p>
                </div>
              )}
            </div>
          )}

          {/* Banner Upload */}
          {selectedType === 'banner_30' && (
            <div className="mt-4 space-y-2">
              <Label>{text.uploadBanner}</Label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              {bannerPreview ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={bannerPreview} alt="Banner preview" className="w-full h-40 object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{text.uploadBanner}</p>
                  <p className="text-xs text-muted-foreground mt-1">{text.maxSize}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button onClick={handlePromote} disabled={loading || uploading} className="w-full">
          {loading || uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin me-2" />
              {uploading ? text.uploading : ''}
            </>
          ) : (
            <Megaphone className="h-4 w-4 me-2" />
          )}
          {text.promote}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PromotePropertyDialog;
