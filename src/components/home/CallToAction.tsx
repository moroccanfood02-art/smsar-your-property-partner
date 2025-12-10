import React from 'react';
import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const CallToAction: React.FC = () => {
  const { dir } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 start-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 end-10 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-gold">
            <Building2 className="w-10 h-10 text-navy-dark" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 font-cairo">
            {dir === 'rtl'
              ? 'هل لديك عقار تريد بيعه أو تأجيره؟'
              : 'Have a Property to Sell or Rent?'}
          </h2>

          {/* Description */}
          <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
            {dir === 'rtl'
              ? 'انضم إلى آلاف الملاك الذين يثقون بنا. سجل عقارك مجاناً واحصل على أفضل العروض من المشترين والمستأجرين المهتمين.'
              : 'Join thousands of property owners who trust us. List your property for free and get the best offers from interested buyers and renters.'}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="gap-2">
              {dir === 'rtl' ? 'سجل عقارك الآن' : 'List Your Property Now'}
              <ArrowIcon className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="xl">
              {dir === 'rtl' ? 'تعرف على المزيد' : 'Learn More'}
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-primary-foreground/60 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gold rounded-full" />
              {dir === 'rtl' ? 'تسجيل مجاني' : 'Free Registration'}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gold rounded-full" />
              {dir === 'rtl' ? 'بدون رسوم مسبقة' : 'No Upfront Fees'}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-gold rounded-full" />
              {dir === 'rtl' ? 'دعم متخصص' : 'Expert Support'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
