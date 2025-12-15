import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Building2, Users, Globe, Award, Target, Eye, Heart, Lightbulb } from 'lucide-react';

const AboutPage = () => {
  const { language } = useLanguage();

  const t = {
    ar: {
      title: 'من نحن',
      subtitle: 'منصة عقارية رائدة تربط بين المشترين والبائعين في المنطقة العربية',
      ourStory: 'قصتنا',
      ourStoryText: 'بدأت رحلتنا في عام 2020 برؤية واضحة: تسهيل عملية البحث عن العقارات وجعلها تجربة سلسة وممتعة للجميع. اليوم، نفخر بخدمة آلاف المستخدمين في جميع أنحاء المنطقة.',
      ourMission: 'مهمتنا',
      ourMissionText: 'نسعى لتسهيل عملية البحث عن العقارات وجعلها تجربة سلسة وممتعة للجميع من خلال توفير منصة موثوقة وشفافة.',
      ourVision: 'رؤيتنا',
      ourVisionText: 'أن نكون المنصة العقارية الأولى في المنطقة العربية، معروفة بالثقة والابتكار وخدمة العملاء المتميزة.',
      ourValues: 'قيمنا',
      transparency: 'الشفافية',
      transparencyText: 'نؤمن بالشفافية الكاملة في جميع تعاملاتنا',
      trust: 'الثقة',
      trustText: 'نبني علاقات طويلة الأمد مع عملائنا',
      innovation: 'الابتكار',
      innovationText: 'نسعى دائماً لتقديم حلول مبتكرة',
      customerFirst: 'العميل أولاً',
      customerFirstText: 'رضا العميل هو أولويتنا القصوى',
      stats: {
        properties: '+10,000',
        propertiesLabel: 'عقار',
        users: '+50,000',
        usersLabel: 'مستخدم',
        cities: '+100',
        citiesLabel: 'مدينة',
        countries: '+20',
        countriesLabel: 'دولة',
      },
    },
    en: {
      title: 'About Us',
      subtitle: 'A leading real estate platform connecting buyers and sellers in the Arab region',
      ourStory: 'Our Story',
      ourStoryText: 'Our journey began in 2020 with a clear vision: to simplify the property search process and make it a seamless experience for everyone. Today, we proudly serve thousands of users across the region.',
      ourMission: 'Our Mission',
      ourMissionText: 'We strive to simplify the property search process and make it a seamless experience for everyone through a reliable and transparent platform.',
      ourVision: 'Our Vision',
      ourVisionText: 'To be the leading real estate platform in the Arab region, known for trust, innovation, and excellent customer service.',
      ourValues: 'Our Values',
      transparency: 'Transparency',
      transparencyText: 'We believe in complete transparency in all our dealings',
      trust: 'Trust',
      trustText: 'We build long-term relationships with our clients',
      innovation: 'Innovation',
      innovationText: 'We always strive to provide innovative solutions',
      customerFirst: 'Customer First',
      customerFirstText: 'Customer satisfaction is our top priority',
      stats: {
        properties: '+10,000',
        propertiesLabel: 'Properties',
        users: '+50,000',
        usersLabel: 'Users',
        cities: '+100',
        citiesLabel: 'Cities',
        countries: '+20',
        countriesLabel: 'Countries',
      },
    },
    fr: {
      title: 'À Propos de Nous',
      subtitle: 'Une plateforme immobilière leader connectant acheteurs et vendeurs dans la région arabe',
      ourStory: 'Notre Histoire',
      ourStoryText: 'Notre parcours a commencé en 2020 avec une vision claire: simplifier le processus de recherche immobilière et en faire une expérience fluide pour tous. Aujourd\'hui, nous servons fièrement des milliers d\'utilisateurs dans toute la région.',
      ourMission: 'Notre Mission',
      ourMissionText: 'Nous nous efforçons de simplifier le processus de recherche immobilière et d\'en faire une expérience fluide pour tous grâce à une plateforme fiable et transparente.',
      ourVision: 'Notre Vision',
      ourVisionText: 'Être la plateforme immobilière leader dans la région arabe, reconnue pour la confiance, l\'innovation et un excellent service client.',
      ourValues: 'Nos Valeurs',
      transparency: 'Transparence',
      transparencyText: 'Nous croyons en une transparence totale dans toutes nos transactions',
      trust: 'Confiance',
      trustText: 'Nous construisons des relations à long terme avec nos clients',
      innovation: 'Innovation',
      innovationText: 'Nous cherchons toujours à fournir des solutions innovantes',
      customerFirst: 'Client d\'abord',
      customerFirstText: 'La satisfaction du client est notre priorité absolue',
      stats: {
        properties: '+10 000',
        propertiesLabel: 'Propriétés',
        users: '+50 000',
        usersLabel: 'Utilisateurs',
        cities: '+100',
        citiesLabel: 'Villes',
        countries: '+20',
        countriesLabel: 'Pays',
      },
    },
    es: {
      title: 'Sobre Nosotros',
      subtitle: 'Una plataforma inmobiliaria líder que conecta compradores y vendedores en la región árabe',
      ourStory: 'Nuestra Historia',
      ourStoryText: 'Nuestro viaje comenzó en 2020 con una visión clara: simplificar el proceso de búsqueda de propiedades y convertirlo en una experiencia fluida para todos. Hoy, servimos con orgullo a miles de usuarios en toda la región.',
      ourMission: 'Nuestra Misión',
      ourMissionText: 'Nos esforzamos por simplificar el proceso de búsqueda de propiedades y convertirlo en una experiencia fluida para todos a través de una plataforma confiable y transparente.',
      ourVision: 'Nuestra Visión',
      ourVisionText: 'Ser la plataforma inmobiliaria líder en la región árabe, conocida por la confianza, la innovación y un excelente servicio al cliente.',
      ourValues: 'Nuestros Valores',
      transparency: 'Transparencia',
      transparencyText: 'Creemos en la transparencia total en todas nuestras transacciones',
      trust: 'Confianza',
      trustText: 'Construimos relaciones a largo plazo con nuestros clientes',
      innovation: 'Innovación',
      innovationText: 'Siempre buscamos proporcionar soluciones innovadoras',
      customerFirst: 'Cliente Primero',
      customerFirstText: 'La satisfacción del cliente es nuestra máxima prioridad',
      stats: {
        properties: '+10.000',
        propertiesLabel: 'Propiedades',
        users: '+50.000',
        usersLabel: 'Usuarios',
        cities: '+100',
        citiesLabel: 'Ciudades',
        countries: '+20',
        countriesLabel: 'Países',
      },
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const values = [
    { icon: Eye, title: text.transparency, description: text.transparencyText },
    { icon: Heart, title: text.trust, description: text.trustText },
    { icon: Lightbulb, title: text.innovation, description: text.innovationText },
    { icon: Users, title: text.customerFirst, description: text.customerFirstText },
  ];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{text.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{text.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Building2, value: text.stats.properties, label: text.stats.propertiesLabel },
            { icon: Users, value: text.stats.users, label: text.stats.usersLabel },
            { icon: Globe, value: text.stats.cities, label: text.stats.citiesLabel },
            { icon: Award, value: text.stats.countries, label: text.stats.countriesLabel },
          ].map((stat, index) => (
            <Card key={index} className="p-6 text-center">
              <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">{text.ourStory}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{text.ourStoryText}</p>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{text.ourMission}</h2>
            </div>
            <p className="text-muted-foreground text-lg">{text.ourMissionText}</p>
          </Card>
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{text.ourVision}</h2>
            </div>
            <p className="text-muted-foreground text-lg">{text.ourVisionText}</p>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-8">{text.ourValues}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
