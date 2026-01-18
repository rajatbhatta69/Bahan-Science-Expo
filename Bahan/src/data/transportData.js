//Location of different bus stations

export const STATIONS = [
  // --- RING ROAD STATIONS ---
  { id: 'kalanki', name: 'Kalanki', lat: 27.6937, lng: 85.2817 },
  { id: 'bafal', name: 'Bafal', lat: 27.6995, lng: 85.2865 },
  { id: 'sitapaila', name: 'Sitapaila', lat: 27.7058, lng: 85.2845 },
  { id: 'swyambhu', name: 'Swyambhu', lat: 27.7125, lng: 85.2860 },
  { id: 'thulo-bharyang', name: 'Thulo Bharyang', lat: 27.7210, lng: 85.2895 },
  { id: 'sano-bharyang', name: 'Sano Bharyang', lat: 27.7250, lng: 85.2930 },
  { id: 'dhungedhara', name: 'Dhungedhara', lat: 27.7285, lng: 85.2970 },
  { id: 'banasthali', name: 'Banasthali', lat: 27.7315, lng: 85.3015 },
  { id: 'balaju', name: 'Balaju', lat: 27.7340, lng: 85.3060 },
  { id: 'macchapokhari', name: 'Macchapokhari', lat: 27.7365, lng: 85.3115 },
  { id: 'gongabu', name: 'Gongabu', lat: 27.7380, lng: 85.3180 },
  { id: 'samakhushi', name: 'Samakhushi', lat: 27.7390, lng: 85.3250 },
  { id: 'basundhara', name: 'Basundhara', lat: 27.7405, lng: 85.3340 },
  { id: 'maharajgunj', name: 'Maharajgunj', lat: 27.7370, lng: 85.3420 },
  { id: 'chabahil', name: 'Chabahil', lat: 27.7170, lng: 85.3480 },
  { id: 'koteshwor', name: 'Koteshwor', lat: 27.6756, lng: 85.3458 },
  { id: 'balkumari', name: 'Balkumari', lat: 27.6705, lng: 85.3385 },
  { id: 'gwarko', name: 'Gwarko', lat: 27.6665, lng: 85.3280 },
  { id: 'satdobato', name: 'Satdobato', lat: 27.6585, lng: 85.3210 },
  { id: 'balkhu', name: 'Balkhu', lat: 27.6845, lng: 85.2925 },
  
  // --- ADDITIONAL CORE STATIONS (For Linear Routes) ---
  { id: 'ratnapark', name: 'Ratnapark', lat: 27.7061, lng: 85.3148 },
  { id: 'raniban', name: 'Raniban', lat: 27.7180, lng: 85.2850 },
  { id: 'jawalakhel', name: 'Jawalakhel', lat: 27.6730, lng: 85.3120 },

  { id: 'dillibazar', name: 'Dillibazar', lat: 27.735, lng: 85.331 }

];


//Routes followed by different buses
export const ROUTES = [
  { 
    id: 'R1', 
    name: 'Ring Road Express', 
    stations: [
      'kalanki', 'bafal', 'sitapaila', 'swyambhu', 'thulo-bharyang', 
      'sano-bharyang', 'dhungedhara', 'banasthali', 'balaju', 
      'macchapokhari', 'gongabu', 'samakhushi', 'basundhara', 
      'maharajgunj', 'chabahil', 'koteshwor', 'balkumari', 
      'gwarko', 'satdobato', 'balkhu', 'kalanki'
    ], 
    isCircular: true,
    color: '#f97316' 
  },
  { 
    id: 'R2', 
    name: 'Balaju-Raniban Yatayat', 
    stations: ['raniban', 'dhungedhara', 'banasthali', 'balaju', 'ratnapark'], 
    isCircular: false,
    color: '#10b981' 
  },
  { 
    id: 'R3', 
    name: 'Ratnapark-Dillibazar Yatayat', 
    stations: ['ratnapark', 'dillibazar'], 
    isCircular: false,
    color: '#10b981' 
  }
];