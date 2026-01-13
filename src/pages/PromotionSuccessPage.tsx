import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Megaphone, ArrowRight } from 'lucide-react';

const PromotionSuccessPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promotionType = searchParams.get('type') || 'featured';

  const t = {
    ar: {
      title: 'تم الترويج بنجاح!',
      description: 'تهانينا! تم تفعيل إعلانك بنجاح وسيظهر للزوار الآن.',
      featuredTitle: 'عقار مميز',
      featuredDesc: 'عقارك يظهر الآن في قسم العقارات المميزة لمدة 7 أيام',
      videoTitle: 'إعلان فيديو',
      videoDesc: 'إعلان الفيديو الخاص بك يظهر الآن في الصفحة الرئيسية لمدة 14 يوم',
      bannerTitle: 'بانر إعلاني',
      bannerDesc: 'البانر الإعلاني يظهر الآن في أعلى الصفحة الرئيسية لمدة 30 يوم',
      myProperties: 'عقاراتي',
      home: 'الصفحة الرئيسية',
      benefits: 'مميزات إعلانك',
      benefit1: 'ظهور أعلى في نتائج البحث',
      benefit2: 'وصول لعدد أكبر من المشترين المحتملين',
      benefit3: 'زيادة في عدد المشاهدات والتواصل',
    },
    en: {
      title: 'Promotion Successful!',
      description: 'Congratulations! Your ad has been activated successfully and will now appear to visitors.',
      featuredTitle: 'Featured Property',
      featuredDesc: 'Your property now appears in the featured section for 7 days',
      videoTitle: 'Video Ad',
      videoDesc: 'Your video ad now appears on the homepage for 14 days',
      bannerTitle: 'Banner Ad',
      bannerDesc: 'Your banner ad now appears at the top of the homepage for 30 days',
      myProperties: 'My Properties',
      home: 'Home',
      benefits: 'Your Ad Benefits',
      benefit1: 'Higher visibility in search results',
      benefit2: 'Reach more potential buyers',
      benefit3: 'Increased views and inquiries',
    },
    fr: {
      title: 'Promotion réussie!',
      description: 'Félicitations! Votre annonce a été activée avec succès et sera maintenant visible par les visiteurs.',
      featuredTitle: 'Propriété en vedette',
      featuredDesc: 'Votre propriété apparaît maintenant dans la section vedette pendant 7 jours',
      videoTitle: 'Publicité vidéo',
      videoDesc: 'Votre publicité vidéo apparaît maintenant sur la page d\'accueil pendant 14 jours',
      bannerTitle: 'Bannière publicitaire',
      bannerDesc: 'Votre bannière apparaît maintenant en haut de la page d\'accueil pendant 30 jours',
      myProperties: 'Mes Propriétés',
      home: 'Accueil',
      benefits: 'Avantages de votre annonce',
      benefit1: 'Meilleure visibilité dans les résultats de recherche',
      benefit2: 'Touchez plus d\'acheteurs potentiels',
      benefit3: 'Plus de vues et de demandes',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const getPromotionDetails = () => {
    switch (promotionType) {
      case 'video':
        return { title: text.videoTitle, desc: text.videoDesc };
      case 'banner':
        return { title: text.bannerTitle, desc: text.bannerDesc };
      default:
        return { title: text.featuredTitle, desc: text.featuredDesc };
    }
  };

  const promotion = getPromotionDetails();

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl md:text-3xl">{text.title}</CardTitle>
              <CardDescription className="text-base">{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Megaphone className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">{promotion.title}</h3>
                </div>
                <p className="text-muted-foreground">{promotion.desc}</p>
              </div>

              <div className="text-start bg-secondary/50 rounded-lg p-6">
                <h4 className="font-semibold mb-3">{text.benefits}</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{text.benefit1}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{text.benefit2}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{text.benefit3}</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/my-properties')}
                >
                  <Megaphone className="w-4 h-4 me-2" />
                  {text.myProperties}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-4 h-4 me-2" />
                  {text.home}
                  <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PromotionSuccessPage;
