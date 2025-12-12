import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Globe, Camera, Save, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const ProfilePage: React.FC = () => {
  const { language, dir } = useLanguage();
  const { user, profile, role, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Morocco');
  const [userLanguage, setUserLanguage] = useState('ar');

  const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const translations = {
    ar: {
      profile: 'الملف الشخصي',
      personalInfo: 'المعلومات الشخصية',
      editYourProfile: 'تعديل بيانات حسابك',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      country: 'الدولة',
      language: 'اللغة',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      saved: 'تم حفظ التغييرات بنجاح',
      error: 'حدث خطأ أثناء الحفظ',
      back: 'العودة',
      accountType: 'نوع الحساب',
      customer: 'زبون',
      owner: 'مالك عقار',
      admin: 'مدير',
      morocco: 'المغرب',
      algeria: 'الجزائر',
      tunisia: 'تونس',
      egypt: 'مصر',
      uae: 'الإمارات',
      saudiArabia: 'السعودية',
      arabic: 'العربية',
      english: 'الإنجليزية',
      french: 'الفرنسية',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      security: 'الأمان',
      emailVerified: 'البريد مُفعّل',
      emailNotVerified: 'البريد غير مُفعّل',
      phoneVerified: 'الهاتف مُفعّل',
      phoneNotVerified: 'الهاتف غير مُفعّل',
    },
    en: {
      profile: 'Profile',
      personalInfo: 'Personal Information',
      editYourProfile: 'Edit your account details',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      country: 'Country',
      language: 'Language',
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Changes saved successfully',
      error: 'Error saving changes',
      back: 'Back',
      accountType: 'Account Type',
      customer: 'Customer',
      owner: 'Property Owner',
      admin: 'Admin',
      morocco: 'Morocco',
      algeria: 'Algeria',
      tunisia: 'Tunisia',
      egypt: 'Egypt',
      uae: 'UAE',
      saudiArabia: 'Saudi Arabia',
      arabic: 'Arabic',
      english: 'English',
      french: 'French',
      loginRequired: 'Please login first',
      security: 'Security',
      emailVerified: 'Email Verified',
      emailNotVerified: 'Email Not Verified',
      phoneVerified: 'Phone Verified',
      phoneNotVerified: 'Phone Not Verified',
    },
    fr: {
      profile: 'Profil',
      personalInfo: 'Informations Personnelles',
      editYourProfile: 'Modifier les détails de votre compte',
      fullName: 'Nom Complet',
      email: 'Email',
      phone: 'Numéro de Téléphone',
      country: 'Pays',
      language: 'Langue',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Modifications enregistrées',
      error: 'Erreur lors de l\'enregistrement',
      back: 'Retour',
      accountType: 'Type de Compte',
      customer: 'Client',
      owner: 'Propriétaire',
      admin: 'Admin',
      morocco: 'Maroc',
      algeria: 'Algérie',
      tunisia: 'Tunisie',
      egypt: 'Égypte',
      uae: 'EAU',
      saudiArabia: 'Arabie Saoudite',
      arabic: 'Arabe',
      english: 'Anglais',
      french: 'Français',
      loginRequired: 'Veuillez vous connecter',
      security: 'Sécurité',
      emailVerified: 'Email Vérifié',
      emailNotVerified: 'Email Non Vérifié',
      phoneVerified: 'Téléphone Vérifié',
      phoneNotVerified: 'Téléphone Non Vérifié',
    },
  };

  const txt = translations[language];

  const countries = [
    { value: 'Morocco', label: txt.morocco },
    { value: 'Algeria', label: txt.algeria },
    { value: 'Tunisia', label: txt.tunisia },
    { value: 'Egypt', label: txt.egypt },
    { value: 'UAE', label: txt.uae },
    { value: 'Saudi Arabia', label: txt.saudiArabia },
  ];

  const languages_list = [
    { value: 'ar', label: txt.arabic },
    { value: 'en', label: txt.english },
    { value: 'fr', label: txt.french },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      toast({ title: txt.loginRequired, variant: 'destructive' });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast, txt.loginRequired]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCountry(profile.country || 'Morocco');
      setUserLanguage(profile.language || 'ar');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone || null,
          country,
          language: userLanguage,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: txt.saved });
    } catch (error) {
      toast({ title: txt.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'customer':
        return txt.customer;
      case 'owner':
        return txt.owner;
      case 'admin':
        return txt.admin;
      default:
        return '';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 gap-2"
            >
              <ArrowIcon className="w-4 h-4" />
              {txt.back}
            </Button>
            <h1 className="text-3xl font-bold text-foreground font-cairo">{txt.profile}</h1>
            <p className="text-muted-foreground mt-1">{txt.editYourProfile}</p>
          </div>

          <div className="grid gap-6">
            {/* Avatar & Role Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-500 text-slate-900 text-2xl font-bold">
                        {fullName ? getInitials(fullName) : <User className="w-10 h-10" />}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 end-0 p-2 bg-amber-500 rounded-full text-slate-900 hover:bg-amber-600 transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{fullName || user.email?.split('@')[0]}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-600 text-sm rounded-full">
                        <Shield className="w-3 h-3" />
                        {getRoleLabel()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  {txt.personalInfo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{txt.fullName}</Label>
                      <div className="relative">
                        <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="ps-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{txt.email}</Label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="ps-10 bg-muted"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{txt.phone}</Label>
                      <div className="relative">
                        <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="ps-10"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">{txt.country}</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">{txt.language}</Label>
                      <Select value={userLanguage} onValueChange={setUserLanguage}>
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {languages_list.map((l) => (
                            <SelectItem key={l.value} value={l.value}>
                              {l.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" variant="gold" disabled={loading} className="gap-2">
                      {loading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {loading ? txt.saving : txt.save}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  {txt.security}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    profile?.email_verified
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    <Mail className="w-4 h-4" />
                    {profile?.email_verified ? txt.emailVerified : txt.emailNotVerified}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    profile?.phone_verified
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Phone className="w-4 h-4" />
                    {profile?.phone_verified ? txt.phoneVerified : txt.phoneNotVerified}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
