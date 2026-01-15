import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t, dir } = useLanguage();

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
              <span className="text-xl font-bold font-cairo">SMSAR</span>
            </Link>
            <p className="text-primary-foreground/70 mb-4 leading-relaxed">
              {dir === 'rtl'
                ? 'منصتك الموثوقة للعثور على عقارك المثالي في أي مكان في العالم.'
                : 'Your trusted platform for finding your perfect property anywhere in the world.'}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              {dir === 'rtl' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('properties')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-bold text-lg mb-4">
              {dir === 'rtl' ? 'أنواع العقارات' : 'Property Types'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/properties?type=sale"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('forSale')}
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=daily"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('dailyRent')}
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=monthly"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('monthlyRent')}
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?type=permanent"
                  className="text-primary-foreground/70 hover:text-gold transition-colors"
                >
                  {t('permanentRent')}
                </Link>
              </li>
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
                <span className="text-primary-foreground/70">
                  {dir === 'rtl'
                    ? 'الدار البيضاء، المغرب'
                    : 'Casablanca, Morocco'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-primary-foreground/70" dir="ltr">
                  +212 600 000 000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-primary-foreground/70">
                  contact@smsar.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 SMSAR. {t('allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-primary-foreground/60 hover:text-gold transition-colors"
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              to="/terms"
              className="text-primary-foreground/60 hover:text-gold transition-colors"
            >
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
