import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const passwordSchema = z.string().min(6);

const ResetPasswordPage: React.FC = () => {
  const { dir, language } = useLanguage();
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const translations = {
    ar: {
      title: 'إعادة تعيين كلمة السر',
      subtitle: 'أدخل كلمة السر الجديدة',
      password: 'كلمة السر الجديدة',
      confirmPassword: 'تأكيد كلمة السر',
      passwordPlaceholder: 'أدخل كلمة السر الجديدة',
      confirmPlaceholder: 'أعد إدخال كلمة السر',
      submit: 'تغيير كلمة السر',
      backToLogin: 'العودة لتسجيل الدخول',
      invalidPassword: 'كلمة السر يجب أن تكون 6 أحرف على الأقل',
      passwordMismatch: 'كلمتا السر غير متطابقتين',
      successTitle: 'تم التغيير!',
      successMessage: 'تم تغيير كلمة السر بنجاح',
      goToLogin: 'الذهاب لتسجيل الدخول',
      error: 'حدث خطأ، حاول مرة أخرى',
    },
    en: {
      title: 'Reset Password',
      subtitle: 'Enter your new password',
      password: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordPlaceholder: 'Enter new password',
      confirmPlaceholder: 'Re-enter password',
      submit: 'Reset Password',
      backToLogin: 'Back to Login',
      invalidPassword: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match',
      successTitle: 'Password Changed!',
      successMessage: 'Your password has been changed successfully',
      goToLogin: 'Go to Login',
      error: 'Something went wrong, please try again',
    },
    fr: {
      title: 'Réinitialiser le Mot de Passe',
      subtitle: 'Entrez votre nouveau mot de passe',
      password: 'Nouveau Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      passwordPlaceholder: 'Entrez le nouveau mot de passe',
      confirmPlaceholder: 'Réentrez le mot de passe',
      submit: 'Réinitialiser',
      backToLogin: 'Retour à la Connexion',
      invalidPassword: 'Le mot de passe doit contenir au moins 6 caractères',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      successTitle: 'Mot de Passe Changé!',
      successMessage: 'Votre mot de passe a été changé avec succès',
      goToLogin: 'Aller à la Connexion',
      error: 'Une erreur est survenue, veuillez réessayer',
    },
  };

  const txt = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordSchema.safeParse(password).success) {
      toast({ title: txt.invalidPassword, variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: txt.passwordMismatch, variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast({ title: txt.error, variant: 'destructive' });
      } else {
        setSuccess(true);
      }
    } catch {
      toast({ title: txt.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-gold">
            <span className="text-slate-900 font-bold text-2xl font-cairo">س</span>
          </div>
          <span className="text-2xl font-bold text-foreground font-cairo">SMSAR</span>
        </Link>

        <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center font-cairo">
                {txt.title}
              </h1>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {txt.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">{txt.password}</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={txt.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ps-10 pe-10"
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">{txt.confirmPassword}</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={txt.confirmPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="ps-10"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      {txt.submit}
                      <ArrowIcon className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 font-cairo">
                {txt.successTitle}
              </h2>
              <p className="text-muted-foreground mb-6">
                {txt.successMessage}
              </p>
              <Button variant="hero" onClick={() => navigate('/auth')}>
                {txt.goToLogin}
              </Button>
            </div>
          )}

          {!success && (
            <Link
              to="/auth"
              className="mt-6 flex items-center justify-center gap-2 text-amber-500 hover:text-amber-600 transition-colors font-medium"
            >
              {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {txt.backToLogin}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
