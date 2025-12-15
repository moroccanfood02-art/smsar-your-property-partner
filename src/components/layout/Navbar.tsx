import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, User, LogOut, Plus, Building2, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, dir } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const currentLang = languages.find((l) => l.code === language);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-lg flex items-center justify-center shadow-gold">
              <span className="text-slate-900 font-bold text-xl font-cairo">س</span>
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

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-500 text-slate-900 text-xs">
                        {profile?.full_name ? getInitials(profile.full_name) : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{profile?.full_name || user.email?.split('@')[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'} className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {role && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 text-xs rounded-full">
                        {role === 'customer' ? (dir === 'rtl' ? 'زبون' : 'Customer') : 
                         role === 'owner' ? (dir === 'rtl' ? 'مالك' : 'Owner') : 
                         (dir === 'rtl' ? 'مدير' : 'Admin')}
                      </span>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 me-2" />
                    {dir === 'rtl' ? 'الملف الشخصي' : 'Profile'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageSquare className="w-4 h-4 me-2" />
                    {dir === 'rtl' ? 'الرسائل' : 'Messages'}
                  </DropdownMenuItem>
                  {(role === 'owner' || role === 'admin') && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/my-properties')}>
                        <Building2 className="w-4 h-4 me-2" />
                        {dir === 'rtl' ? 'عقاراتي' : 'My Properties'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/add-property')}>
                        <Plus className="w-4 h-4 me-2" />
                        {dir === 'rtl' ? 'إضافة عقار' : 'Add Property'}
                      </DropdownMenuItem>
                    </>
                  )}
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="w-4 h-4 me-2" />
                      {dir === 'rtl' ? 'لوحة التحكم' : 'Dashboard'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 me-2" />
                    {dir === 'rtl' ? 'تسجيل الخروج' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  {t('login')}
                </Button>
                <Button variant="gold" size="sm" onClick={() => navigate('/auth')}>
                  {t('register')}
                </Button>
              </>
            )}
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
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                {user ? (
                  <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                    {dir === 'rtl' ? 'تسجيل الخروج' : 'Sign Out'}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                      {t('login')}
                    </Button>
                    <Button variant="gold" className="flex-1" onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}>
                      {t('register')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
