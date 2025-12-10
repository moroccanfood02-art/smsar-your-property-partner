import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email();

const ForgotPasswordPage: React.FC = () => {
  const { dir, language } = useLanguage();
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const translations = {
    ar: {
      title: 'استرجاع كلمة السر',
      subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة السر',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      submit: 'إرسال رابط الاسترجاع',
      backToLogin: 'العودة لتسجيل الدخول',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      successTitle: 'تم الإرسال!',
      successMessage: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة السر',
      error: 'حدث خطأ، حاول مرة أخرى',
    },
    en: {
      title: 'Forgot Password',
      subtitle: "Enter your email and we'll send you a link to reset your password",
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      submit: 'Send Reset Link',
      backToLogin: 'Back to Login',
      invalidEmail: 'Invalid email address',
      successTitle: 'Email Sent!',
      successMessage: 'Check your email for a link to reset your password',
      error: 'Something went wrong, please try again',
    },
    fr: {
      title: 'Mot de Passe Oublié',
      subtitle: 'Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe',
      email: 'Email',
      emailPlaceholder: 'Entrez votre email',
      submit: 'Envoyer le Lien',
      backToLogin: 'Retour à la Connexion',
      invalidEmail: 'Adresse email invalide',
      successTitle: 'Email Envoyé!',
      successMessage: 'Vérifiez votre email pour un lien de réinitialisation',
      error: 'Une erreur est survenue, veuillez réessayer',
    },
  };

  const txt = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailSchema.safeParse(email).success) {
      toast({ title: txt.invalidEmail, variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: txt.error, variant: 'destructive' });
      } else {
        setSent(true);
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
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center font-cairo">
                {txt.title}
              </h1>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {txt.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">{txt.email}</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={txt.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
            </div>
          )}

          <Link
            to="/auth"
            className="mt-6 flex items-center justify-center gap-2 text-amber-500 hover:text-amber-600 transition-colors font-medium"
          >
            {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {txt.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
