import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, dir, language } = useLanguage();
  const { settings } = useSiteSettings();

  const cityText = language === 'ar' ? settings.company_city
    : language === 'fr' ? settings.company_city_fr
    : settings.company_city_en;

  const descText = language === 'ar' ? settings.company_description_ar
    : language === 'fr' ? settings.company_description_fr
    : settings.company_description_en;

  const socialLinks = [
    { url: settings.facebook_url, icon: Facebook },
    { url: settings.twitter_url, icon: Twitter },
    { url: settings.instagram_url, icon: Instagram },
    { url: settings.linkedin_url, icon: Linkedin },
  ];

  return (
    <footer ref={ref} className="bg-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
                <span className="text-navy-dark font-bold text-xl font-cairo">س</span>
              </div>
              <span className="text-xl font-bold font-cairo">{settings.company_name}</span>
            </Link>
            <p className="text-primary-foreground/70 mb-4 leading-relaxed">{descText}</p>
            <div className="flex gap-3">
              {socialLinks.map(({ url, icon: Icon }, i) => (
                <a
                  key={i}
                  href={url || '#'}
                  target={url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              {dir === 'rtl' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: t('home') },
                { to: '/properties', label: t('properties') },
                { to: '/about', label: t('about') },
                { to: '/contact', label: t('contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/70 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              {dir === 'rtl' ? 'أنواع العقارات' : 'Property Types'}
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/properties?type=sale', label: t('forSale') },
                { to: '/properties?type=daily', label: t('dailyRent') },
                { to: '/properties?type=monthly', label: t('monthlyRent') },
                { to: '/properties?type=permanent', label: t('permanentRent') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary-foreground/70 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              {dir === 'rtl' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <span className="text-primary-foreground/70">{cityText}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-primary-foreground/70" dir="ltr">{settings.company_phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-primary-foreground/70">{settings.company_email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} {settings.company_name}. {t('allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-gold transition-colors">
              {t('privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-gold transition-colors">
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
