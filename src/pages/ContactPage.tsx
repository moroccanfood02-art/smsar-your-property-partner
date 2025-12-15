import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const ContactPage = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const t = {
    ar: {
      title: 'تواصل معنا',
      subtitle: 'نحن هنا لمساعدتك. أرسل لنا رسالة وسنرد عليك في أقرب وقت',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      subject: 'الموضوع',
      message: 'الرسالة',
      send: 'إرسال',
      sending: 'جاري الإرسال...',
      messageSent: 'تم إرسال رسالتك بنجاح',
      address: 'العنوان',
      addressValue: 'الدار البيضاء، المغرب',
      workingHours: 'ساعات العمل',
      mondayToFriday: 'الإثنين - الجمعة: 9:00 - 18:00',
      saturday: 'السبت: 9:00 - 13:00',
      getInTouch: 'تواصل معنا',
      contactInfo: 'معلومات الاتصال',
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We are here to help. Send us a message and we will respond as soon as possible',
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
      sending: 'Sending...',
      messageSent: 'Your message has been sent successfully',
      address: 'Address',
      addressValue: 'Casablanca, Morocco',
      workingHours: 'Working Hours',
      mondayToFriday: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 9:00 AM - 1:00 PM',
      getInTouch: 'Get in Touch',
      contactInfo: 'Contact Information',
    },
    fr: {
      title: 'Contactez-nous',
      subtitle: 'Nous sommes là pour vous aider. Envoyez-nous un message et nous vous répondrons dès que possible',
      name: 'Nom',
      email: 'Email',
      subject: 'Sujet',
      message: 'Message',
      send: 'Envoyer',
      sending: 'Envoi en cours...',
      messageSent: 'Votre message a été envoyé avec succès',
      address: 'Adresse',
      addressValue: 'Casablanca, Maroc',
      workingHours: 'Heures de travail',
      mondayToFriday: 'Lundi - Vendredi: 9h00 - 18h00',
      saturday: 'Samedi: 9h00 - 13h00',
      getInTouch: 'Contactez-nous',
      contactInfo: 'Informations de Contact',
    },
    es: {
      title: 'Contáctanos',
      subtitle: 'Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible',
      name: 'Nombre',
      email: 'Correo Electrónico',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Enviar',
      sending: 'Enviando...',
      messageSent: 'Tu mensaje ha sido enviado con éxito',
      address: 'Dirección',
      addressValue: 'Casablanca, Marruecos',
      workingHours: 'Horario de Trabajo',
      mondayToFriday: 'Lunes - Viernes: 9:00 - 18:00',
      saturday: 'Sábado: 9:00 - 13:00',
      getInTouch: 'Ponte en Contacto',
      contactInfo: 'Información de Contacto',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: text.messageSent,
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">{text.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{text.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">{text.getInTouch}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {text.name}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {text.email}
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {text.subject}
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {text.message}
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  text.sending
                ) : (
                  <>
                    <Send className="w-4 h-4 me-2" />
                    {text.send}
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6">{text.contactInfo}</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{text.address}</h3>
                    <p className="text-muted-foreground">{text.addressValue}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{text.email}</h3>
                    <p className="text-muted-foreground">contact@smsar.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+212 5XX-XXXXXX</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{text.workingHours}</h3>
                    <p className="text-muted-foreground">{text.mondayToFriday}</p>
                    <p className="text-muted-foreground">{text.saturday}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map Placeholder */}
            <Card className="p-0 overflow-hidden h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212270.5387983861!2d-7.7322!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca%2C%20Morocco!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
