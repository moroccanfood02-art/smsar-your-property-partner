// Cities organized by country/region
export const citiesByCountry = {
  // Morocco - المغرب
  morocco: [
    'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 
    'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Mohammedia', 'El Jadida', 'Beni Mellal',
    'Nador', 'Taza', 'Settat', 'Larache', 'Khouribga', 'Guelmim', 'Berkane',
    'Khemisset', 'Taourirt', 'Errachidia', 'Essaouira', 'Ifrane', 'Ouarzazate',
    'Dakhla', 'Laayoune', 'Tiznit', 'Al Hoceima', 'Chefchaouen', 'Azrou'
  ],
  
  // Spain - إسبانيا
  spain: [
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia',
    'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
    'Gijón', 'Granada', 'A Coruña', 'Vitoria-Gasteiz', 'Santa Cruz de Tenerife',
    'Pamplona', 'Almería', 'San Sebastián', 'Burgos', 'Santander', 'Toledo', 'Marbella'
  ],
  
  // France - فرنسا
  france: [
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
    'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne',
    'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand',
    'Le Mans', 'Aix-en-Provence', 'Brest', 'Tours', 'Cannes', 'Monaco'
  ],
  
  // USA - أمريكا
  usa: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
    'Denver', 'Washington DC', 'Boston', 'Nashville', 'Detroit', 'Portland',
    'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Miami', 'Atlanta'
  ],
  
  // Gulf Countries - دول الخليج
  uae: [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ],
  saudi: [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran', 'Tabuk',
    'Taif', 'Buraidah', 'Najran', 'Jubail', 'Yanbu', 'Abha', 'Al Ahsa', 'Khamis Mushait'
  ],
  qatar: ['Doha', 'Al Wakrah', 'Al Khor', 'Dukhan', 'Mesaieed', 'Al Rayyan'],
  kuwait: ['Kuwait City', 'Hawalli', 'Salmiya', 'Farwaniya', 'Jahra', 'Ahmadi', 'Fahaheel'],
  bahrain: ['Manama', 'Muharraq', 'Riffa', 'Hamad Town', 'Isa Town', 'Sitra'],
  oman: ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibra', 'Barka', 'Seeb'],
  
  // East Africa - شرق أفريقيا
  kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi', 'Thika'],
  tanzania: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Zanzibar', 'Mbeya', 'Tanga'],
  ethiopia: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Hawassa', 'Bahir Dar'],
  uganda: ['Kampala', 'Gulu', 'Mbarara', 'Jinja', 'Entebbe', 'Lira', 'Mbale'],
  rwanda: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi'],
  djibouti: ['Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil'],
  somalia: ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Berbera', 'Beledweyne'],
  sudan: ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'Nyala', 'El Obeid'],
  eritrea: ['Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera']
};

// Get all cities as a flat array with country info
export const getAllCities = () => {
  const cities: { city: string; country: string; region: string }[] = [];
  
  const countryNames: Record<string, { name: string; region: string }> = {
    morocco: { name: 'Morocco', region: 'Africa' },
    spain: { name: 'Spain', region: 'Europe' },
    france: { name: 'France', region: 'Europe' },
    usa: { name: 'USA', region: 'North America' },
    uae: { name: 'UAE', region: 'Gulf' },
    saudi: { name: 'Saudi Arabia', region: 'Gulf' },
    qatar: { name: 'Qatar', region: 'Gulf' },
    kuwait: { name: 'Kuwait', region: 'Gulf' },
    bahrain: { name: 'Bahrain', region: 'Gulf' },
    oman: { name: 'Oman', region: 'Gulf' },
    kenya: { name: 'Kenya', region: 'East Africa' },
    tanzania: { name: 'Tanzania', region: 'East Africa' },
    ethiopia: { name: 'Ethiopia', region: 'East Africa' },
    uganda: { name: 'Uganda', region: 'East Africa' },
    rwanda: { name: 'Rwanda', region: 'East Africa' },
    djibouti: { name: 'Djibouti', region: 'East Africa' },
    somalia: { name: 'Somalia', region: 'East Africa' },
    sudan: { name: 'Sudan', region: 'East Africa' },
    eritrea: { name: 'Eritrea', region: 'East Africa' }
  };

  Object.entries(citiesByCountry).forEach(([countryKey, countryCities]) => {
    const countryInfo = countryNames[countryKey];
    countryCities.forEach(city => {
      cities.push({
        city,
        country: countryInfo.name,
        region: countryInfo.region
      });
    });
  });

  return cities;
};

// Get cities for dropdown (just city names)
export const getCityOptions = () => {
  return getAllCities().map(c => c.city).sort();
};

// Get countries for dropdown
export const getCountryOptions = () => {
  return [
    'Morocco', 'Spain', 'France', 'USA', 
    'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
    'Kenya', 'Tanzania', 'Ethiopia', 'Uganda', 'Rwanda', 'Djibouti', 'Somalia', 'Sudan', 'Eritrea'
  ];
};

// Translations for countries
export const countryTranslations = {
  ar: {
    Morocco: 'المغرب',
    Spain: 'إسبانيا',
    France: 'فرنسا',
    USA: 'الولايات المتحدة',
    UAE: 'الإمارات',
    'Saudi Arabia': 'السعودية',
    Qatar: 'قطر',
    Kuwait: 'الكويت',
    Bahrain: 'البحرين',
    Oman: 'عُمان',
    Kenya: 'كينيا',
    Tanzania: 'تنزانيا',
    Ethiopia: 'إثيوبيا',
    Uganda: 'أوغندا',
    Rwanda: 'رواندا',
    Djibouti: 'جيبوتي',
    Somalia: 'الصومال',
    Sudan: 'السودان',
    Eritrea: 'إريتريا'
  },
  en: {
    Morocco: 'Morocco',
    Spain: 'Spain',
    France: 'France',
    USA: 'USA',
    UAE: 'UAE',
    'Saudi Arabia': 'Saudi Arabia',
    Qatar: 'Qatar',
    Kuwait: 'Kuwait',
    Bahrain: 'Bahrain',
    Oman: 'Oman',
    Kenya: 'Kenya',
    Tanzania: 'Tanzania',
    Ethiopia: 'Ethiopia',
    Uganda: 'Uganda',
    Rwanda: 'Rwanda',
    Djibouti: 'Djibouti',
    Somalia: 'Somalia',
    Sudan: 'Sudan',
    Eritrea: 'Eritrea'
  },
  fr: {
    Morocco: 'Maroc',
    Spain: 'Espagne',
    France: 'France',
    USA: 'États-Unis',
    UAE: 'Émirats Arabes Unis',
    'Saudi Arabia': 'Arabie Saoudite',
    Qatar: 'Qatar',
    Kuwait: 'Koweït',
    Bahrain: 'Bahreïn',
    Oman: 'Oman',
    Kenya: 'Kenya',
    Tanzania: 'Tanzanie',
    Ethiopia: 'Éthiopie',
    Uganda: 'Ouganda',
    Rwanda: 'Rwanda',
    Djibouti: 'Djibouti',
    Somalia: 'Somalie',
    Sudan: 'Soudan',
    Eritrea: 'Érythrée'
  },
  es: {
    Morocco: 'Marruecos',
    Spain: 'España',
    France: 'Francia',
    USA: 'Estados Unidos',
    UAE: 'Emiratos Árabes Unidos',
    'Saudi Arabia': 'Arabia Saudita',
    Qatar: 'Catar',
    Kuwait: 'Kuwait',
    Bahrain: 'Bahréin',
    Oman: 'Omán',
    Kenya: 'Kenia',
    Tanzania: 'Tanzania',
    Ethiopia: 'Etiopía',
    Uganda: 'Uganda',
    Rwanda: 'Ruanda',
    Djibouti: 'Yibuti',
    Somalia: 'Somalia',
    Sudan: 'Sudán',
    Eritrea: 'Eritrea'
  }
};
