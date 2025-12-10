import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, dir } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-gold rounded-lg flex items-center justify-center shadow-gold">
              <span className="text-navy-dark font-bold text-xl font-cairo">س</span>
            </div>
            <span className="text-xl font-bold text-foreground font-cairo">
              SMSAR
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t('home')}
            </Link>
            <Link
              to="/properties"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t('properties')}
            </Link>
            <Link
              to="/about"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t('about')}
            </Link>
            <Link
              to="/contact"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
            >
              {t('contact')}
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{currentLang?.flag}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'}>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-secondary' : ''}
                  >
                    <span className="me-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm">
              {t('login')}
            </Button>
            <Button variant="gold" size="sm">
              {t('register')}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-up">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <Link
                to="/properties"
                className="text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('properties')}
              </Link>
              <Link
                to="/about"
                className="text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('about')}
              </Link>
              <Link
                to="/contact"
                className="text-foreground/80 hover:text-foreground transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('contact')}
              </Link>
              
              <div className="flex gap-2 pt-4 border-t border-border/50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                      language === lang.code
                        ? 'bg-gold text-navy-dark'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  {t('login')}
                </Button>
                <Button variant="gold" className="flex-1">
                  {t('register')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
