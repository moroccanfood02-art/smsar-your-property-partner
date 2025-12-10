import React, { useState } from 'react';
import { Search, MapPin, Home, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

type PropertyTypeFilter = 'sale' | 'daily' | 'monthly' | 'permanent';

const HeroSection: React.FC = () => {
  const { t, dir } = useLanguage();
  const [activeType, setActiveType] = useState<PropertyTypeFilter>('sale');

  const propertyTypes: { key: PropertyTypeFilter; icon: React.ReactNode }[] = [
    { key: 'sale', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'daily', icon: <Calendar className="w-4 h-4" /> },
    { key: 'monthly', icon: <Calendar className="w-4 h-4" /> },
    { key: 'permanent', icon: <Home className="w-4 h-4" /> },
  ];

  const getTypeLabel = (key: PropertyTypeFilter): string => {
    switch (key) {
      case 'sale':
        return t('forSale');
      case 'daily':
        return t('dailyRent');
      case 'monthly':
        return t('monthlyRent');
      case 'permanent':
        return t('permanentRent');
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 start-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 end-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl"
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-gold text-sm font-medium">
              {dir === 'rtl' ? 'المنصة العقارية الأولى' : '#1 Real Estate Platform'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-up font-cairo" style={{ animationDelay: '0.1s' }}>
            {t('heroTitle')}
            <span className="block text-gradient-gold mt-2">
              {dir === 'rtl' ? 'مع SMSAR' : 'with SMSAR'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('heroSubtitle')}
          </p>

          {/* Search Card */}
          <div className="bg-card/95 backdrop-blur-lg rounded-2xl p-6 shadow-prominent animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {/* Property Type Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {propertyTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveType(type.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeType === type.key
                      ? 'bg-gradient-gold text-navy-dark shadow-gold'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {type.icon}
                  {getTypeLabel(type.key)}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="ps-12 h-14 text-lg bg-background border-border focus:border-gold focus:ring-gold"
                />
              </div>
              <Button variant="hero" size="xl" className="gap-2 min-w-[160px]">
                <Search className="w-5 h-5" />
                {t('search')}
              </Button>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {['Casablanca', 'Marrakech', 'Rabat', 'Dubai', 'Paris'].map((city) => (
                <button
                  key={city}
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '10K+', label: t('properties_count') },
              { value: '50K+', label: t('users_count') },
              { value: '100+', label: t('cities_count') },
              { value: '15+', label: t('countries_count') },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-primary-foreground/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
