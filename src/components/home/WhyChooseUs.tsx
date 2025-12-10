import React from 'react';
import { Shield, Zap, Globe, HeadphonesIcon, Award, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  {
    icon: Shield,
    titleEn: 'Verified Properties',
    titleAr: 'عقارات موثقة',
    descEn: 'All properties are verified by our team to ensure authenticity and quality.',
    descAr: 'جميع العقارات موثقة من قبل فريقنا لضمان المصداقية والجودة.',
  },
  {
    icon: Zap,
    titleEn: 'Fast Transactions',
    titleAr: 'معاملات سريعة',
    descEn: 'Streamlined process for quick and hassle-free property transactions.',
    descAr: 'عملية مبسطة لمعاملات عقارية سريعة وخالية من المتاعب.',
  },
  {
    icon: Globe,
    titleEn: 'Global Reach',
    titleAr: 'انتشار عالمي',
    descEn: 'Access properties from over 15 countries across 3 continents.',
    descAr: 'الوصول إلى عقارات من أكثر من 15 دولة عبر 3 قارات.',
  },
  {
    icon: HeadphonesIcon,
    titleEn: '24/7 Support',
    titleAr: 'دعم على مدار الساعة',
    descEn: 'Our support team is available around the clock to assist you.',
    descAr: 'فريق الدعم متاح على مدار الساعة لمساعدتك.',
  },
  {
    icon: Award,
    titleEn: 'Best Prices',
    titleAr: 'أفضل الأسعار',
    descEn: 'Competitive pricing with no hidden fees or surprises.',
    descAr: 'أسعار تنافسية بدون رسوم خفية أو مفاجآت.',
  },
  {
    icon: TrendingUp,
    titleEn: 'Market Insights',
    titleAr: 'رؤى السوق',
    descEn: 'Stay informed with real-time market trends and analytics.',
    descAr: 'ابق على اطلاع بأحدث اتجاهات السوق والتحليلات.',
  },
];

const WhyChooseUs: React.FC = () => {
  const { dir } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-full mb-4">
            <Award className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">
              {dir === 'rtl' ? 'لماذا نحن' : 'Why Us'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-cairo">
            {dir === 'rtl' ? 'لماذا تختار SMSAR؟' : 'Why Choose SMSAR?'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {dir === 'rtl'
              ? 'نقدم لك تجربة عقارية استثنائية مع أفضل الخدمات والميزات'
              : 'We provide an exceptional real estate experience with the best services and features'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-card rounded-2xl border border-border hover:border-gold/30 hover:shadow-elevated transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-gold">
                <feature.icon className="w-7 h-7 text-navy-dark" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 font-cairo">
                {dir === 'rtl' ? feature.titleAr : feature.titleEn}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {dir === 'rtl' ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
