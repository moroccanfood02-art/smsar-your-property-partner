import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Building2, Phone, Mail, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings';
import { useToast } from '@/hooks/use-toast';

interface AdminSettingsTabProps {
  language: string;
}

const AdminSettingsTab = ({ language }: AdminSettingsTabProps) => {
  const { settings, loading, updateMultiple } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const isRtl = language === 'ar';

  const text = {
    ar: {
      title: 'إعدادات الموقع',
      subtitle: 'معلومات الشركة التي تظهر في أسفل كل صفحة',
      companyInfo: 'معلومات الشركة',
      companyName: 'اسم الشركة',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      descriptions: 'وصف الشركة',
      descAr: 'الوصف بالعربية',
      descEn: 'الوصف بالإنجليزية',
      descFr: 'الوصف بالفرنسية',
      locations: 'الموقع الجغرافي',
      cityAr: 'المدينة (عربي)',
      cityEn: 'المدينة (إنجليزي)',
      cityFr: 'المدينة (فرنسي)',
      socialMedia: 'مواقع التواصل الاجتماعي',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      saved: 'تم حفظ الإعدادات بنجاح',
    },
    en: {
      title: 'Site Settings',
      subtitle: 'Company information displayed at the bottom of every page',
      companyInfo: 'Company Information',
      companyName: 'Company Name',
      phone: 'Phone Number',
      email: 'Email Address',
      descriptions: 'Company Description',
      descAr: 'Description (Arabic)',
      descEn: 'Description (English)',
      descFr: 'Description (French)',
      locations: 'Location',
      cityAr: 'City (Arabic)',
      cityEn: 'City (English)',
      cityFr: 'City (French)',
      socialMedia: 'Social Media',
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Settings saved successfully',
    },
    fr: {
      title: 'Paramètres du Site',
      subtitle: 'Informations de la société affichées en bas de chaque page',
      companyInfo: 'Informations de la Société',
      companyName: 'Nom de la Société',
      phone: 'Téléphone',
      email: 'Adresse Email',
      descriptions: 'Description de la Société',
      descAr: 'Description (Arabe)',
      descEn: 'Description (Anglais)',
      descFr: 'Description (Français)',
      locations: 'Localisation',
      cityAr: 'Ville (Arabe)',
      cityEn: 'Ville (Anglais)',
      cityFr: 'Ville (Français)',
      socialMedia: 'Réseaux Sociaux',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      saved: 'Paramètres enregistrés',
    },
  };

  const t = text[language as keyof typeof text] || text.ar;

  const handleSave = async () => {
    setSaving(true);
    await updateMultiple(form);
    toast({ title: t.saved });
    setSaving(false);
  };

  const update = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t.title}</h2>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? t.saving : t.save}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {t.companyInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Building2 className="h-3.5 w-3.5" /> {t.companyName}
              </Label>
              <Input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Phone className="h-3.5 w-3.5" /> {t.phone}
              </Label>
              <Input value={form.company_phone} onChange={(e) => update('company_phone', e.target.value)} dir="ltr" />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Mail className="h-3.5 w-3.5" /> {t.email}
              </Label>
              <Input value={form.company_email} onChange={(e) => update('company_email', e.target.value)} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              {t.locations}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">{t.cityAr}</Label>
              <Input value={form.company_city} onChange={(e) => update('company_city', e.target.value)} dir="rtl" />
            </div>
            <div>
              <Label className="mb-2 block">{t.cityEn}</Label>
              <Input value={form.company_city_en} onChange={(e) => update('company_city_en', e.target.value)} dir="ltr" />
            </div>
            <div>
              <Label className="mb-2 block">{t.cityFr}</Label>
              <Input value={form.company_city_fr} onChange={(e) => update('company_city_fr', e.target.value)} dir="ltr" />
            </div>
          </CardContent>
        </Card>

        {/* Descriptions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              {t.descriptions}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">{t.descAr}</Label>
              <Textarea value={form.company_description_ar} onChange={(e) => update('company_description_ar', e.target.value)} dir="rtl" rows={3} />
            </div>
            <div>
              <Label className="mb-2 block">{t.descEn}</Label>
              <Textarea value={form.company_description_en} onChange={(e) => update('company_description_en', e.target.value)} dir="ltr" rows={3} />
            </div>
            <div>
              <Label className="mb-2 block">{t.descFr}</Label>
              <Textarea value={form.company_description_fr} onChange={(e) => update('company_description_fr', e.target.value)} dir="ltr" rows={3} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              {t.socialMedia}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2"><Facebook className="h-3.5 w-3.5" /> Facebook</Label>
              <Input value={form.facebook_url} onChange={(e) => update('facebook_url', e.target.value)} dir="ltr" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><Twitter className="h-3.5 w-3.5" /> Twitter / X</Label>
              <Input value={form.twitter_url} onChange={(e) => update('twitter_url', e.target.value)} dir="ltr" placeholder="https://x.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><Instagram className="h-3.5 w-3.5" /> Instagram</Label>
              <Input value={form.instagram_url} onChange={(e) => update('instagram_url', e.target.value)} dir="ltr" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</Label>
              <Input value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} dir="ltr" placeholder="https://linkedin.com/..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
