import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Zap, Building2 } from 'lucide-react';

const PLANS = {
  basic: {
    price_id: 'price_1SehfNJApEwoLmdC0fPZ94hc',
    product_id: 'prod_TbvW8PaQgfr30v',
    price: 99,
  },
  pro: {
    price_id: 'price_1SehfsJApEwoLmdCUSP1lgLb',
    product_id: 'prod_TbvWpow0T1aX1I',
    price: 199,
  },
  premium: {
    price_id: 'price_1Sehg8JApEwoLmdCg6ZIwAeO',
    product_id: 'prod_TbvX2IHjgiu5yD',
    price: 499,
  },
};

const PricingPage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const t = {
    ar: {
      title: 'خطط الأسعار',
      subtitle: 'اختر الخطة المناسبة لاحتياجاتك',
      monthly: '/شهرياً',
      currency: 'درهم',
      subscribe: 'اشترك الآن',
      currentPlan: 'خطتك الحالية',
      popular: 'الأكثر شعبية',
      basic: {
        name: 'الباقة الأساسية',
        features: [
          '5 إعلانات عقارية شهرياً',
          'دعم عبر البريد الإلكتروني',
          'إحصائيات أساسية',
          'ظهور في نتائج البحث',
        ],
      },
      pro: {
        name: 'الباقة الاحترافية',
        features: [
          '15 إعلان عقاري شهرياً',
          'دعم أولوية',
          'إحصائيات متقدمة',
          'ظهور مميز في البحث',
          'شارة "موثق"',
        ],
      },
      premium: {
        name: 'الباقة المميزة',
        features: [
          'إعلانات غير محدودة',
          'دعم VIP على مدار الساعة',
          'تحليلات متقدمة',
          'ظهور في الصفحة الرئيسية',
          'شارة "مميز"',
          'إدارة حساب مخصصة',
        ],
      },
      loginRequired: 'يجب تسجيل الدخول أولاً',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
    },
    en: {
      title: 'Pricing Plans',
      subtitle: 'Choose the plan that fits your needs',
      monthly: '/month',
      currency: 'MAD',
      subscribe: 'Subscribe Now',
      currentPlan: 'Your Plan',
      popular: 'Most Popular',
      basic: {
        name: 'Basic Plan',
        features: [
          '5 property listings per month',
          'Email support',
          'Basic statistics',
          'Search results visibility',
        ],
      },
      pro: {
        name: 'Pro Plan',
        features: [
          '15 property listings per month',
          'Priority support',
          'Advanced statistics',
          'Featured in search',
          'Verified badge',
        ],
      },
      premium: {
        name: 'Premium Plan',
        features: [
          'Unlimited listings',
          '24/7 VIP support',
          'Advanced analytics',
          'Homepage feature',
          'Premium badge',
          'Dedicated account manager',
        ],
      },
      loginRequired: 'Please login first',
      error: 'An error occurred, please try again',
    },
    fr: {
      title: 'Plans Tarifaires',
      subtitle: 'Choisissez le plan qui correspond à vos besoins',
      monthly: '/mois',
      currency: 'MAD',
      subscribe: 'S\'abonner',
      currentPlan: 'Votre Plan',
      popular: 'Plus Populaire',
      basic: {
        name: 'Plan Basique',
        features: [
          '5 annonces par mois',
          'Support par email',
          'Statistiques de base',
          'Visibilité dans les recherches',
        ],
      },
      pro: {
        name: 'Plan Pro',
        features: [
          '15 annonces par mois',
          'Support prioritaire',
          'Statistiques avancées',
          'Mis en avant dans les recherches',
          'Badge vérifié',
        ],
      },
      premium: {
        name: 'Plan Premium',
        features: [
          'Annonces illimitées',
          'Support VIP 24/7',
          'Analyses avancées',
          'Mise en avant sur la page d\'accueil',
          'Badge premium',
          'Gestionnaire de compte dédié',
        ],
      },
      loginRequired: 'Veuillez vous connecter',
      error: 'Une erreur est survenue',
    },
    es: {
      title: 'Planes de Precios',
      subtitle: 'Elige el plan que se adapte a tus necesidades',
      monthly: '/mes',
      currency: 'MAD',
      subscribe: 'Suscribirse',
      currentPlan: 'Tu Plan',
      popular: 'Más Popular',
      basic: {
        name: 'Plan Básico',
        features: [
          '5 anuncios por mes',
          'Soporte por email',
          'Estadísticas básicas',
          'Visibilidad en búsquedas',
        ],
      },
      pro: {
        name: 'Plan Pro',
        features: [
          '15 anuncios por mes',
          'Soporte prioritario',
          'Estadísticas avanzadas',
          'Destacado en búsquedas',
          'Insignia verificado',
        ],
      },
      premium: {
        name: 'Plan Premium',
        features: [
          'Anuncios ilimitados',
          'Soporte VIP 24/7',
          'Análisis avanzados',
          'Destacado en página principal',
          'Insignia premium',
          'Gestor de cuenta dedicado',
        ],
      },
      loginRequired: 'Por favor inicia sesión',
      error: 'Ocurrió un error, intenta de nuevo',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const handleSubscribe = async (planKey: 'basic' | 'pro' | 'premium') => {
    if (!user) {
      toast({ title: text.loginRequired, variant: 'destructive' });
      navigate('/auth');
      return;
    }

    setLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS[planKey].price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: text.error, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      key: 'basic' as const,
      icon: Building2,
      name: text.basic.name,
      price: PLANS.basic.price,
      features: text.basic.features,
      popular: false,
    },
    {
      key: 'pro' as const,
      icon: Zap,
      name: text.pro.name,
      price: PLANS.pro.price,
      features: text.pro.features,
      popular: true,
    },
    {
      key: 'premium' as const,
      icon: Crown,
      name: text.premium.name,
      price: PLANS.premium.price,
      features: text.premium.features,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">{text.title}</h1>
          <p className="text-lg text-muted-foreground">{text.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`p-8 relative ${
                plan.popular ? 'border-primary ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  {text.popular}
                </Badge>
              )}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <plan.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{text.currency}{text.monthly}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
              >
                {loading === plan.key ? '...' : text.subscribe}
              </Button>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
