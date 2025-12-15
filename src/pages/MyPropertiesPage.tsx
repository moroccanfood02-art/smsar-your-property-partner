import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  property_type: string;
  listing_type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  views_count: number;
  created_at: string;
}

const MyPropertiesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const t = {
    ar: {
      title: 'عقاراتي',
      addNew: 'إضافة عقار جديد',
      noProperties: 'لا توجد عقارات',
      noPropertiesDesc: 'لم تقم بإضافة أي عقارات بعد',
      edit: 'تعديل',
      delete: 'حذف',
      view: 'عرض',
      views: 'مشاهدة',
      deleteConfirm: 'هل أنت متأكد من حذف هذا العقار؟',
      deleteDesc: 'لا يمكن التراجع عن هذا الإجراء',
      cancel: 'إلغاء',
      confirmDelete: 'حذف',
      deleteSuccess: 'تم حذف العقار بنجاح',
      deleteError: 'حدث خطأ أثناء حذف العقار',
      sale: 'للبيع',
      rent: 'للإيجار',
      available: 'متاح',
      sold: 'مباع',
      rented: 'مؤجر',
    },
    fr: {
      title: 'Mes Propriétés',
      addNew: 'Ajouter une propriété',
      noProperties: 'Aucune propriété',
      noPropertiesDesc: "Vous n'avez pas encore ajouté de propriétés",
      edit: 'Modifier',
      delete: 'Supprimer',
      view: 'Voir',
      views: 'vues',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette propriété?',
      deleteDesc: 'Cette action est irréversible',
      cancel: 'Annuler',
      confirmDelete: 'Supprimer',
      deleteSuccess: 'Propriété supprimée avec succès',
      deleteError: 'Erreur lors de la suppression',
      sale: 'À vendre',
      rent: 'À louer',
      available: 'Disponible',
      sold: 'Vendu',
      rented: 'Loué',
    },
    en: {
      title: 'My Properties',
      addNew: 'Add New Property',
      noProperties: 'No Properties',
      noPropertiesDesc: "You haven't added any properties yet",
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      views: 'views',
      deleteConfirm: 'Are you sure you want to delete this property?',
      deleteDesc: 'This action cannot be undone',
      cancel: 'Cancel',
      confirmDelete: 'Delete',
      deleteSuccess: 'Property deleted successfully',
      deleteError: 'Error deleting property',
      sale: 'For Sale',
      rent: 'For Rent',
      available: 'Available',
      sold: 'Sold',
      rented: 'Rented',
    },
  };

  const text = t[language as keyof typeof t] || t.ar;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (propertyId: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) {
      toast({
        title: text.deleteError,
        variant: 'destructive',
      });
    } else {
      toast({
        title: text.deleteSuccess,
      });
      setProperties(properties.filter((p) => p.id !== propertyId));
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-MA' : 'fr-MA').format(price) + ' ' + currency;
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      available: 'bg-green-500',
      sold: 'bg-red-500',
      rented: 'bg-blue-500',
    };
    return statusColors[status] || 'bg-gray-500';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{text.title}</h1>
          <Button onClick={() => navigate('/add-property')} className="gap-2">
            <Plus className="h-5 w-5" />
            {text.addNew}
          </Button>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-foreground mb-2">{text.noProperties}</h2>
            <p className="text-muted-foreground mb-6">{text.noPropertiesDesc}</p>
            <Button onClick={() => navigate('/add-property')} className="gap-2">
              <Plus className="h-5 w-5" />
              {text.addNew}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={property.images?.[0] || '/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge className={getStatusBadge(property.status)}>
                      {text[property.status as keyof typeof text]}
                    </Badge>
                    <Badge variant="secondary">
                      {text[property.listing_type as keyof typeof text]}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 bg-background/80 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {property.views_count} {text.views}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.city}
                  </div>
                  <p className="text-primary font-bold text-xl mb-3">
                    {formatPrice(property.price, property.currency)}
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" /> {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {property.bathrooms}
                      </span>
                    )}
                    {property.area && (
                      <span className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" /> {property.area} م²
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {text.view}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/edit-property/${property.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {text.edit}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{text.deleteConfirm}</AlertDialogTitle>
                        <AlertDialogDescription>{text.deleteDesc}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{text.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(property.id)}>
                          {text.confirmDelete}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyPropertiesPage;
