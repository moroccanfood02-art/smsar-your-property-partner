import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Eye, EyeOff, Lock, Mail, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

const SecuritySettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const t = {
    ar: {
      title: 'إعدادات الأمان',
      subtitle: 'إدارة أمان حسابك وخصوصيتك',
      changePassword: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      updatePassword: 'تحديث كلمة المرور',
      updating: 'جاري التحديث...',
      twoFactor: 'المصادقة الثنائية',
      twoFactorDesc: 'أضف طبقة إضافية من الأمان لحسابك',
      enable2FA: 'تفعيل المصادقة الثنائية',
      comingSoon: 'قريباً',
      loginActivity: 'نشاط تسجيل الدخول',
      loginActivityDesc: 'راقب من يقوم بالوصول إلى حسابك',
      emailSecurity: 'أمان البريد الإلكتروني',
      emailVerified: 'البريد الإلكتروني مُفعّل',
      emailNotVerified: 'البريد الإلكتروني غير مُفعّل',
      verifyEmail: 'تأكيد البريد الإلكتروني',
      passwordStrength: 'قوة كلمة المرور',
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
      passwordMismatch: 'كلمتا المرور غير متطابقتين',
      passwordTooShort: 'كلمة المرور قصيرة جداً (الحد الأدنى 8 أحرف)',
      passwordUpdated: 'تم تحديث كلمة المرور بنجاح',
      passwordUpdateError: 'حدث خطأ أثناء تحديث كلمة المرور',
      loginRequired: 'يجب تسجيل الدخول أولاً',
      securityTips: 'نصائح الأمان',
      tip1: 'استخدم كلمة مرور فريدة لهذا الحساب',
      tip2: 'لا تشارك كلمة المرور مع أي شخص',
      tip3: 'قم بتحديث كلمة المرور بانتظام',
      tip4: 'تأكد من تسجيل الخروج من الأجهزة العامة'
    },
    en: {
      title: 'Security Settings',
      subtitle: 'Manage your account security and privacy',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      updatePassword: 'Update Password',
      updating: 'Updating...',
      twoFactor: 'Two-Factor Authentication',
      twoFactorDesc: 'Add an extra layer of security to your account',
      enable2FA: 'Enable 2FA',
      comingSoon: 'Coming Soon',
      loginActivity: 'Login Activity',
      loginActivityDesc: 'Monitor who is accessing your account',
      emailSecurity: 'Email Security',
      emailVerified: 'Email Verified',
      emailNotVerified: 'Email Not Verified',
      verifyEmail: 'Verify Email',
      passwordStrength: 'Password Strength',
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password too short (minimum 8 characters)',
      passwordUpdated: 'Password updated successfully',
      passwordUpdateError: 'Error updating password',
      loginRequired: 'Please login first',
      securityTips: 'Security Tips',
      tip1: 'Use a unique password for this account',
      tip2: 'Never share your password with anyone',
      tip3: 'Update your password regularly',
      tip4: 'Always sign out from public devices'
    },
    fr: {
      title: 'Paramètres de Sécurité',
      subtitle: 'Gérez la sécurité de votre compte et votre confidentialité',
      changePassword: 'Changer le Mot de Passe',
      currentPassword: 'Mot de Passe Actuel',
      newPassword: 'Nouveau Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      updatePassword: 'Mettre à Jour',
      updating: 'Mise à jour...',
      twoFactor: 'Authentification à Deux Facteurs',
      twoFactorDesc: 'Ajoutez une couche de sécurité supplémentaire',
      enable2FA: 'Activer 2FA',
      comingSoon: 'Bientôt Disponible',
      loginActivity: 'Activité de Connexion',
      loginActivityDesc: 'Surveillez qui accède à votre compte',
      emailSecurity: 'Sécurité Email',
      emailVerified: 'Email Vérifié',
      emailNotVerified: 'Email Non Vérifié',
      verifyEmail: 'Vérifier Email',
      passwordStrength: 'Force du Mot de Passe',
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordTooShort: 'Mot de passe trop court (minimum 8 caractères)',
      passwordUpdated: 'Mot de passe mis à jour avec succès',
      passwordUpdateError: 'Erreur lors de la mise à jour',
      loginRequired: 'Veuillez vous connecter',
      securityTips: 'Conseils de Sécurité',
      tip1: 'Utilisez un mot de passe unique',
      tip2: 'Ne partagez jamais votre mot de passe',
      tip3: 'Mettez à jour régulièrement',
      tip4: 'Déconnectez-vous des appareils publics'
    },
    es: {
      title: 'Configuración de Seguridad',
      subtitle: 'Administra la seguridad de tu cuenta y privacidad',
      changePassword: 'Cambiar Contraseña',
      currentPassword: 'Contraseña Actual',
      newPassword: 'Nueva Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      updatePassword: 'Actualizar',
      updating: 'Actualizando...',
      twoFactor: 'Autenticación de Dos Factores',
      twoFactorDesc: 'Agrega una capa extra de seguridad',
      enable2FA: 'Habilitar 2FA',
      comingSoon: 'Próximamente',
      loginActivity: 'Actividad de Inicio de Sesión',
      loginActivityDesc: 'Monitorea quién accede a tu cuenta',
      emailSecurity: 'Seguridad del Email',
      emailVerified: 'Email Verificado',
      emailNotVerified: 'Email No Verificado',
      verifyEmail: 'Verificar Email',
      passwordStrength: 'Fortaleza de Contraseña',
      weak: 'Débil',
      medium: 'Media',
      strong: 'Fuerte',
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordTooShort: 'Contraseña muy corta (mínimo 8 caracteres)',
      passwordUpdated: 'Contraseña actualizada exitosamente',
      passwordUpdateError: 'Error al actualizar la contraseña',
      loginRequired: 'Por favor inicia sesión',
      securityTips: 'Consejos de Seguridad',
      tip1: 'Usa una contraseña única para esta cuenta',
      tip2: 'Nunca compartas tu contraseña',
      tip3: 'Actualiza tu contraseña regularmente',
      tip4: 'Cierra sesión en dispositivos públicos'
    }
  };

  const text = t[language as keyof typeof t] || t.ar;

  const getPasswordStrength = (password: string): { level: string; color: string; width: string } => {
    if (password.length === 0) return { level: '', color: 'bg-muted', width: 'w-0' };
    if (password.length < 6) return { level: text.weak, color: 'bg-red-500', width: 'w-1/3' };
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { level: text.medium, color: 'bg-yellow-500', width: 'w-2/3' };
    }
    return { level: text.strong, color: 'bg-green-500', width: 'w-full' };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast({ title: text.passwordTooShort, variant: 'destructive' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: text.passwordMismatch, variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({ title: text.passwordUpdated });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({ title: text.passwordUpdateError, variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-4">{text.loginRequired}</p>
          <Button onClick={() => navigate('/auth')}>
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{text.title}</h1>
              <p className="text-muted-foreground">{text.subtitle}</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Email Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {text.emailSecurity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{user.email}</span>
                    {user.email_confirmed_at ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">{text.emailVerified}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{text.emailNotVerified}</span>
                      </div>
                    )}
                  </div>
                  {!user.email_confirmed_at && (
                    <Button variant="outline" size="sm">
                      {text.verifyEmail}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {text.changePassword}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{text.newPassword}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all`} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {text.passwordStrength}: {passwordStrength.level}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{text.confirmPassword}</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isChangingPassword}>
                    <Lock className="w-4 h-4 mr-2" />
                    {isChangingPassword ? text.updating : text.updatePassword}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  {text.twoFactor}
                </CardTitle>
                <CardDescription>{text.twoFactorDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                      disabled
                    />
                    <span className="text-sm text-muted-foreground">{text.enable2FA}</span>
                  </div>
                  <Badge variant="secondary">{text.comingSoon}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {text.securityTips}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[text.tip1, text.tip2, text.tip3, text.tip4].map((tip, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SecuritySettingsPage;
