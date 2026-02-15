import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface PropertyMapProps {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string;
  country: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  latitude, 
  longitude, 
  address, 
  city, 
  country 
}) => {
  const { language } = useLanguage();

  const translations = {
    ar: {
      location: 'الموقع',
      openInMaps: 'فتح في الخرائط',
      noLocation: 'الموقع الجغرافي غير متوفر',
      address: 'العنوان',
    },
    en: {
      location: 'Location',
      openInMaps: 'Open in Maps',
      noLocation: 'Location not available',
      address: 'Address',
    },
    fr: {
      location: 'Emplacement',
      openInMaps: 'Ouvrir dans Maps',
      noLocation: 'Emplacement non disponible',
      address: 'Adresse',
    },
  };

  const txt = translations[language];

  const fullAddress = [address, city, country].filter(Boolean).join(', ');
  
  const googleMapsUrl = latitude && longitude
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`;

  const staticMapUrl = latitude && longitude
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          {txt.location}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Interactive Map */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          {latitude && longitude ? (
            <>
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                className="absolute inset-0 border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.007},${longitude + 0.01},${latitude + 0.007}&layer=mapnik&marker=${latitude},${longitude}`}
                allowFullScreen
              />

              {/* Open in Maps button */}
              <Button
                asChild
                size="sm"
                className="absolute top-3 end-3 bg-background/90 backdrop-blur-sm hover:bg-background text-foreground shadow-md"
              >
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 me-2" />
                  {txt.openInMaps}
                </a>
              </Button>

              {/* Coordinates */}
              <div className="absolute bottom-3 start-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs shadow-md">
                <span className="text-muted-foreground">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <MapPin className="w-12 h-12 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">{txt.noLocation}</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 me-2" />
                  {txt.openInMaps}
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
          <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">{txt.address}</p>
            <p className="font-medium">{fullAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyMap;
