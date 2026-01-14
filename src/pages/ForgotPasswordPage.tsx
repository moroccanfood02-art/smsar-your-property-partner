import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, RefreshCw, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import OTPInput from '@/components/auth/OTPInput';
import { z } from 'zod';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

type Step = 'email' | 'otp' | 'password' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const { dir, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const translations = {
    ar: {
      title: 'استرجاع كلمة السر',
      subtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      submit: 'إرسال رمز التحقق',
      backToLogin: 'العودة لتسجيل الدخول',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      otpTitle: 'أدخل رمز التحقق',
      otpSubtitle: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
      verify: 'تحقق',
      resend: 'إعادة الإرسال',
      resendIn: 'إعادة الإرسال خلال',
      seconds: 'ثانية',
      otpSent: 'تم إرسال رمز التحقق',
      otpError: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
      back: 'رجوع',
      passwordTitle: 'كلمة السر الجديدة',
      passwordSubtitle: 'أدخل كلمة السر الجديدة',
      password: 'كلمة السر الجديدة',
      confirmPassword: 'تأكيد كلمة السر',
      passwordPlaceholder: 'أدخل كلمة السر الجديدة',
      confirmPlaceholder: 'أعد إدخال كلمة السر',
      changePassword: 'تغيير كلمة السر',
      invalidPassword: 'كلمة السر يجب أن تكون 6 أحرف على الأقل',
      passwordMismatch: 'كلمتا السر غير متطابقتين',
      successTitle: 'تم التغيير!',
      successMessage: 'تم تغيير كلمة السر بنجاح',
      goToLogin: 'الذهاب لتسجيل الدخول',
      error: 'حدث خطأ، حاول مرة أخرى',
    },
    en: {
      title: 'Forgot Password',
      subtitle: "Enter your email and we'll send you a verification code",
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      submit: 'Send Verification Code',
      backToLogin: 'Back to Login',
      invalidEmail: 'Invalid email address',
      otpTitle: 'Enter Verification Code',
      otpSubtitle: 'A verification code has been sent to your email',
      verify: 'Verify',
      resend: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 'seconds',
      otpSent: 'Verification code sent',
      otpError: 'Invalid or expired verification code',
      back: 'Back',
      passwordTitle: 'New Password',
      passwordSubtitle: 'Enter your new password',
      password: 'New Password',
      confirmPassword: 'Confirm Password',
      passwordPlaceholder: 'Enter new password',
      confirmPlaceholder: 'Re-enter password',
      changePassword: 'Change Password',
      invalidPassword: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match',
      successTitle: 'Password Changed!',
      successMessage: 'Your password has been changed successfully',
      goToLogin: 'Go to Login',
      error: 'Something went wrong, please try again',
    },
    fr: {
      title: 'Mot de Passe Oublié',
      subtitle: 'Entrez votre email et nous vous enverrons un code de vérification',
      email: 'Email',
      emailPlaceholder: 'Entrez votre email',
      submit: 'Envoyer le Code',
      backToLogin: 'Retour à la Connexion',
      invalidEmail: 'Adresse email invalide',
      otpTitle: 'Entrez le Code de Vérification',
      otpSubtitle: 'Un code de vérification a été envoyé à votre email',
      verify: 'Vérifier',
      resend: 'Renvoyer le Code',
      resendIn: 'Renvoyer dans',
      seconds: 'secondes',
      otpSent: 'Code de vérification envoyé',
      otpError: 'Code de vérification invalide ou expiré',
      back: 'Retour',
      passwordTitle: 'Nouveau Mot de Passe',
      passwordSubtitle: 'Entrez votre nouveau mot de passe',
      password: 'Nouveau Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      passwordPlaceholder: 'Entrez le nouveau mot de passe',
      confirmPlaceholder: 'Réentrez le mot de passe',
      changePassword: 'Changer le Mot de Passe',
      invalidPassword: 'Le mot de passe doit contenir au moins 6 caractères',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      successTitle: 'Mot de Passe Changé!',
      successMessage: 'Votre mot de passe a été changé avec succès',
      goToLogin: 'Aller à la Connexion',
      error: 'Une erreur est survenue, veuillez réessayer',
    },
  };

  const txt = translations[language];

  const startCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOTP = async () => {
    if (!emailSchema.safeParse(email).success) {
      toast({ title: txt.invalidEmail, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('send-otp', {
        body: { email, purpose: 'password_reset', language },
      });

      if (response.error) throw response.error;

      toast({ title: txt.otpSent });
      setStep('otp');
      startCooldown();
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({ title: txt.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('verify-otp', {
        body: { email, code: otpCode, purpose: 'password_reset' },
      });

      if (response.error) throw response.error;

      if (!response.data?.valid) {
        toast({ title: txt.otpError, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Store the reset token if available
      if (response.data?.actionLink) {
        // Extract token from action link and sign in with it
        const url = new URL(response.data.actionLink);
        const token = url.hash?.match(/access_token=([^&]+)/)?.[1] || url.searchParams.get('token');
        
        if (token) {
          setResetToken(token);
        }
      }

      setStep('password');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({ title: txt.otpError, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
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
      // Use the admin function to update password
      const response = await supabase.functions.invoke('update-password', {
        body: { email, password },
      });

      if (response.error) throw response.error;

      if (response.data?.success) {
        setStep('success');
      } else {
        toast({ title: txt.error, variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({ title: txt.error, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await sendOTP();
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
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center font-cairo">
                {txt.title}
              </h1>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {txt.subtitle}
              </p>

              <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-4">
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
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center font-cairo">
                {txt.otpTitle}
              </h1>
              <p className="text-muted-foreground mb-2 text-center text-sm">
                {txt.otpSubtitle}
              </p>
              <p className="text-amber-500 mb-6 text-center text-sm font-medium" dir="ltr">
                {email}
              </p>

              <div className="mb-6">
                <OTPInput value={otpCode} onChange={setOtpCode} disabled={loading} />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2 mb-4"
                disabled={loading || otpCode.length !== 6}
                onClick={verifyOTP}
              >
                {loading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    {txt.verify}
                    <ArrowIcon className="w-5 h-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {dir === 'rtl' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {txt.back}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className={`flex items-center gap-1 ${
                    resendCooldown > 0 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-amber-500 hover:text-amber-600'
                  } transition-colors`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 
                    ? `${txt.resendIn} ${resendCooldown} ${txt.seconds}`
                    : txt.resend
                  }
                </button>
              </div>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'password' && (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-2 text-center font-cairo">
                {txt.passwordTitle}
              </h1>
              <p className="text-muted-foreground mb-6 text-center text-sm">
                {txt.passwordSubtitle}
              </p>

              <form onSubmit={(e) => { e.preventDefault(); changePassword(); }} className="space-y-4">
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
                      {txt.changePassword}
                      <ArrowIcon className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
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

          {step !== 'success' && (
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

export default ForgotPasswordPage;