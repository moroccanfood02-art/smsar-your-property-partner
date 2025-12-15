import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SubscriptionSuccessPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = {
    ar: {
      title: 'تم الاشتراك بنجاح!',
      message: 'شكراً لاشتراكك. يمكنك الآن الاستفادة من جميع ميزات خطتك.',
      dashboard: 'الذهاب للوحة التحكم',
      addProperty: 'إضافة عقار',
    },
    en: {
      title: 'Subscription Successful!',
      message: 'Thank you for subscribing. You can now enjoy all the features of your plan.',
      dashboard: 'Go to Dashboard',
      addProperty: 'Add Property',
    },
    fr: {
      title: 'Abonnement Réussi!',
      message: 'Merci pour votre abonnement. Vous pouvez maintenant profiter de toutes les fonctionnalités.',
      dashboard: 'Aller au Tableau de Bord',
      addProperty: 'Ajouter une Propriété',
    },
    es: {
      title: '¡Suscripción Exitosa!',
      message: 'Gracias por suscribirte. Ahora puedes disfrutar de todas las características de tu plan.',
      dashboard: 'Ir al Panel',
      addProperty: 'Agregar Propiedad',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">{text.title}</h1>
        <p className="text-muted-foreground mb-8">{text.message}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={() => navigate('/dashboard')}>
            {text.dashboard}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/add-property')}>
            {text.addProperty}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;
