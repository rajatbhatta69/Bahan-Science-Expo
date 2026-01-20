// Location of different bus stations with Dual-Lane precision (CW/ACW)
export const STATIONS = [
  // --- RING ROAD STATIONS ---
  { id: 'kalanki', name: 'Kalanki', cw: { lat: 27.695695, lng: 85.281364 }, acw: { lat: 27.696294, lng: 85.281760 } },
  { id: 'bafal', name: 'Bafal', cw: { lat: 27.700996, lng: 85.281580 }, acw: { lat: 27.700834, lng: 85.281956 } },
  { id: 'sitapaila', name: 'Sitapaila', cw: { lat: 27.706985, lng: 85.282314 }, acw: { lat: 27.707298, lng: 85.282727 } },
  { id: 'swyambhu', name: 'Swyambhu', cw: { lat: 27.716473, lng: 85.283498 }, acw: { lat: 27.715681, lng: 85.283717 } },
  { id: 'thulo-bharyang', name: 'Thulo Bharyang', cw: { lat: 27.719809, lng: 85.287085 }, acw: { lat: 27.719990, lng: 85.287956 } },
  // FIXED: Added sano-bharyang which was missing
  { id: 'sano-bharyang', name: 'Sano Bharyang', cw: { lat: 27.7215, lng: 85.2910 }, acw: { lat: 27.7212, lng: 85.2905 } },
  { id: 'dhungedhara', name: 'Dhungedhara', cw: { lat: 27.723456, lng: 85.294579 }, acw: { lat: 27.723082, lng: 85.294263 } },
  { id: 'banasthali', name: 'Banasthali', cw: { lat: 27.725005, lng: 85.298022 }, acw: { lat: 27.724523, lng: 85.297280 } },
  { id: 'balaju', name: 'Balaju', cw: { lat: 27.727447, lng: 85.304864 }, acw: { lat: 27.726644, lng: 85.304293 } },
  { id: 'macchapokhari', name: 'Macchapokhari', cw: { lat: 27.735489, lng: 85.305954 }, acw: { lat: 27.734755, lng: 85.305742 } },
  { id: 'gongabu', name: 'Gongabu', cw: { lat: 27.735128, lng: 85.314454 }, acw: { lat: 27.734780, lng: 85.314232 } },
  { id: 'samakhushi', name: 'Samakhushi', cw: { lat: 27.735259, lng: 85.318632 }, acw: { lat: 27.734888, lng: 85.317522 } },
  { id: 'basundhara', name: 'Basundhara', cw: { lat: 27.742255, lng: 85.332266 }, acw: { lat: 27.741833, lng: 85.331671 } },
  { id: 'maharajgunj', name: 'Maharajgunj', cw: { lat: 27.739912, lng: 85.337654 }, acw: { lat: 27.739996, lng: 85.336783 } },
  { id: 'chabahil', name: 'Chabahil', cw: { lat: 27.716742, lng: 85.346665 }, acw: { lat: 27.717429, lng: 85.346524 } },
  { id: 'koteshwor', name: 'Koteshwor', cw: { lat: 27.680655, lng: 85.349740 }, acw: { lat: 27.679871, lng: 85.349417 } },
  { id: 'balkumari', name: 'Balkumari', cw: { lat: 27.673766, lng: 85.342867 }, acw: { lat: 27.673933, lng: 85.342479 } },
  { id: 'gwarko', name: 'Gwarko', cw: { lat: 27.667700, lng: 85.333892 }, acw: { lat: 27.667816, lng: 85.333281 } },
  { id: 'satdobato', name: 'Satdobato', cw: { lat: 27.658329, lng: 85.324378 }, acw: { lat: 27.659025, lng: 85.324898 } },
  { id: 'balkhu', name: 'Balkhu', cw: { lat: 27.684248, lng: 85.301314 }, acw: { lat: 27.684381, lng: 85.302051 } },

  // --- CORE CITY STATIONS ---
  { id: 'ratnapark', name: 'Ratnapark', cw: { lat: 27.7061, lng: 85.3148 }, acw: { lat: 27.7061, lng: 85.3148 } },
  { id: 'raniban', name: 'Raniban', cw: { lat: 27.7180, lng: 85.2850 }, acw: { lat: 27.7180, lng: 85.2850 } },
  { id: 'dillibazar', name: 'Dillibazar', cw: { lat: 27.7045, lng: 85.3288 }, acw: { lat: 27.7045, lng: 85.3288 } }
];

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
    color: '#3b82f6'
  }
];