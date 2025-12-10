import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type AuthMode = 'login' | 'register';
type UserRole = 'customer' | 'owner';

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);
const phoneSchema = z.string().min(8).optional();
const nameSchema = z.string().min(2);

const AuthPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const translations = {
    ar: {
      welcome: 'مرحباً بك في SMSAR',
      loginTitle: 'تسجيل الدخول',
      registerTitle: 'إنشاء حساب جديد',
      loginSubtitle: 'سجل دخولك للوصول إلى حسابك',
      registerSubtitle: 'انضم إلينا وابدأ رحلتك العقارية',
      email: 'البريد الإلكتروني',
      password: 'كلمة السر',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      forgotPassword: 'نسيت كلمة السر؟',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      createAccount: 'إنشاء حساب',
      loginNow: 'تسجيل الدخول',
      selectRole: 'اختر نوع الحساب',
      customer: 'زبون',
      customerDesc: 'ابحث واحجز العقارات',
      owner: 'مالك عقار',
      ownerDesc: 'أضف وأدر عقاراتك',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      passwordPlaceholder: 'أدخل كلمة السر',
      namePlaceholder: 'أدخل اسمك الكامل',
      phonePlaceholder: 'أدخل رقم هاتفك',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      invalidPassword: 'كلمة السر يجب أن تكون 6 أحرف على الأقل',
      invalidName: 'الاسم يجب أن يكون حرفين على الأقل',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      registerSuccess: 'تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني',
      loginError: 'البريد الإلكتروني أو كلمة السر غير صحيحة',
      registerError: 'حدث خطأ أثناء إنشاء الحساب',
      userExists: 'هذا البريد الإلكتروني مسجل بالفعل',
    },
    en: {
      welcome: 'Welcome to SMSAR',
      loginTitle: 'Sign In',
      registerTitle: 'Create Account',
      loginSubtitle: 'Sign in to access your account',
      registerSubtitle: 'Join us and start your real estate journey',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot password?',
      login: 'Sign In',
      register: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      createAccount: 'Create Account',
      loginNow: 'Sign In',
      selectRole: 'Select Account Type',
      customer: 'Customer',
      customerDesc: 'Search and book properties',
      owner: 'Property Owner',
      ownerDesc: 'Add and manage your properties',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      namePlaceholder: 'Enter your full name',
      phonePlaceholder: 'Enter your phone number',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Password must be at least 6 characters',
      invalidName: 'Name must be at least 2 characters',
      loginSuccess: 'Successfully signed in',
      registerSuccess: 'Account created! Check your email for verification',
      loginError: 'Invalid email or password',
      registerError: 'Error creating account',
      userExists: 'This email is already registered',
    },
    fr: {
      welcome: 'Bienvenue sur SMSAR',
      loginTitle: 'Connexion',
      registerTitle: 'Créer un Compte',
      loginSubtitle: 'Connectez-vous pour accéder à votre compte',
      registerSubtitle: 'Rejoignez-nous et commencez votre voyage immobilier',
      email: 'Email',
      password: 'Mot de passe',
      fullName: 'Nom Complet',
      phone: 'Numéro de Téléphone',
      forgotPassword: 'Mot de passe oublié?',
      login: 'Se Connecter',
      register: 'Créer un Compte',
      noAccount: "Vous n'avez pas de compte?",
      hasAccount: 'Vous avez déjà un compte?',
      createAccount: 'Créer un Compte',
      loginNow: 'Se Connecter',
      selectRole: 'Sélectionner le Type de Compte',
      customer: 'Client',
      customerDesc: 'Rechercher et réserver des propriétés',
      owner: 'Propriétaire',
      ownerDesc: 'Ajouter et gérer vos propriétés',
      emailPlaceholder: 'Entrez votre email',
      passwordPlaceholder: 'Entrez votre mot de passe',
      namePlaceholder: 'Entrez votre nom complet',
      phonePlaceholder: 'Entrez votre numéro de téléphone',
      invalidEmail: 'Adresse email invalide',
      invalidPassword: 'Le mot de passe doit contenir au moins 6 caractères',
      invalidName: 'Le nom doit contenir au moins 2 caractères',
      loginSuccess: 'Connexion réussie',
      registerSuccess: 'Compte créé! Vérifiez votre email',
      loginError: 'Email ou mot de passe invalide',
      registerError: 'Erreur lors de la création du compte',
      userExists: 'Cet email est déjà enregistré',
    },
  };

  const txt = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate email
      if (!emailSchema.safeParse(email).success) {
        toast({ title: txt.invalidEmail, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Validate password
      if (!passwordSchema.safeParse(password).success) {
        toast({ title: txt.invalidPassword, variant: 'destructive' });
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: txt.loginError, variant: 'destructive' });
        } else {
          toast({ title: txt.loginSuccess });
          navigate('/');
        }
      } else {
        // Validate name for registration
        if (!nameSchema.safeParse(fullName).success) {
          toast({ title: txt.invalidName, variant: 'destructive' });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          phone: phone || undefined,
          role: selectedRole,
          country: 'Morocco',
          language,
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: txt.userExists, variant: 'destructive' });
          } else {
            toast({ title: txt.registerError, variant: 'destructive' });
          }
        } else {
          toast({ title: txt.registerSuccess });
          navigate('/');
        }
      }
    } catch (error) {
      toast({ title: mode === 'login' ? txt.loginError : txt.registerError, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-gold">
              <span className="text-slate-900 font-bold text-2xl font-cairo">س</span>
            </div>
            <span className="text-2xl font-bold text-foreground font-cairo">SMSAR</span>
          </Link>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-2 font-cairo">
            {mode === 'login' ? txt.loginTitle : txt.registerTitle}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'login' ? txt.loginSubtitle : txt.registerSubtitle}
          </p>

          {/* Role Selection (Register only) */}
          {mode === 'register' && (
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">{txt.selectRole}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`p-4 rounded-xl border-2 transition-all text-start ${
                    selectedRole === 'customer'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                      : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <Users className={`w-6 h-6 mb-2 ${selectedRole === 'customer' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <p className="font-semibold text-foreground">{txt.customer}</p>
                  <p className="text-xs text-muted-foreground">{txt.customerDesc}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('owner')}
                  className={`p-4 rounded-xl border-2 transition-all text-start ${
                    selectedRole === 'owner'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                      : 'border-border hover:border-amber-500/50'
                  }`}
                >
                  <Building2 className={`w-6 h-6 mb-2 ${selectedRole === 'owner' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <p className="font-semibold text-foreground">{txt.owner}</p>
                  <p className="text-xs text-muted-foreground">{txt.ownerDesc}</p>
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <Label htmlFor="fullName">{txt.fullName}</Label>
                  <div className="relative mt-1">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={txt.namePlaceholder}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="ps-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">{txt.phone}</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={txt.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="ps-10"
                      dir="ltr"
                    />
                  </div>
                </div>
              </>
            )}

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

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{txt.password}</Label>
                {mode === 'login' && (
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    {txt.forgotPassword}
                  </Link>
                )}
              </div>
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
                  {mode === 'login' ? txt.login : txt.register}
                  <ArrowIcon className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-muted-foreground">
            {mode === 'login' ? txt.noAccount : txt.hasAccount}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-amber-500 hover:text-amber-600 font-semibold transition-colors"
            >
              {mode === 'login' ? txt.createAccount : txt.loginNow}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 start-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 end-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_0_hsl(38_92%_50%_/_0.3)]">
            <span className="text-slate-900 font-bold text-6xl font-cairo">س</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 font-cairo">
            {txt.welcome}
          </h2>
          <p className="text-white/70 max-w-md">
            {dir === 'rtl'
              ? 'منصتك الموثوقة للعثور على عقارك المثالي في أي مكان في العالم'
              : 'Your trusted platform for finding your perfect property anywhere in the world'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
