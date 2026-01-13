import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Megaphone, Star, Video, Image, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('featured');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const promotionTypes = [
    {
      id: 'featured',
      icon: Star,
      title: text.featured,
      description: text.featuredDesc,
      price: text.featuredPrice,
      popular: false,
    },
    {
      id: 'video',
      icon: Video,
      title: text.video,
      description: text.videoDesc,
      price: text.videoPrice,
      popular: true,
    },
    {
      id: 'banner',
      icon: Image,
      title: text.banner,
      description: text.bannerDesc,
      price: text.bannerPrice,
      popular: false,
    },
  ];

  const handlePromote = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-promotion-checkout', {
        body: {
          propertyId,
          promotionType: selectedType,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        setOpen(false);
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast({
        title: text.error,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
        </div>

        <Button onClick={handlePromote} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
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
