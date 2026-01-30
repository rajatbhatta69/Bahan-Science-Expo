// Location of different bus stations with Dual-Lane precision (CW/ACW)
export const STATIONS = [
  // --- RING ROAD STATIONS ---
  { id: 'kalanki', name: 'Kalanki', cw: { lat: 27.695695, lng: 85.281364 }, acw: { lat: 27.696294, lng: 85.281760 } },
  { id: 'bafal', name: 'Bafal', cw: { lat: 27.700996, lng: 85.281580 }, acw: { lat: 27.700834, lng: 85.281956 } },
  { id: 'sitapaila', name: 'Sitapaila', cw: { lat: 27.706985, lng: 85.282314 }, acw: { lat: 27.707298, lng: 85.282727 } },
  { id: 'swyambhu', name: 'Swoyambhu', cw: { lat: 27.716473, lng: 85.283498 }, acw: { lat: 27.715681, lng: 85.283717 } },
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
  //Here cw is coming towards station and acw is moving away from station to reach final destination

  //From raniban to rnac-cw, from rnac to raniban-acw
  // --- BALAJU-RANIBAN-CITY LINE STATIONS ---
  { id: 'raniban', name: 'Raniban', cw: { lat: 27.730132, lng: 85.287483 }, acw: { lat: 27.730085, lng: 85.287453 } },
  { id: 'nayabazar', name: 'Nayabazar', cw: { lat: 27.725193, lng: 85.305748 }, acw: { lat: 27.724979, lng: 85.305634 } },
  { id: 'sorhakhutte', name: 'Sorhakhutte', cw: { lat: 27.719656, lng: 85.309413 }, acw: { lat: 27.719512, lng: 85.309368 } },
  { id: 'thamel', name: 'Thamel', cw: { lat: 27.718214, lng: 85.312036 }, acw: { lat: 27.718143, lng: 85.311736 } },
  { id: 'lainchaur', name: 'Lainchaur', cw: { lat: 27.717339, lng: 85.314983 }, acw: { lat: 27.717154, lng: 85.314949 } },
  { id: 'jamal', name: 'Jamal', cw: { lat: 27.709164, lng: 85.316273 }, acw: { lat: 27.709164, lng: 85.316273 } },
  { id: 'ratnapark', name: 'Ratnapark', cw: { lat: 27.706458, lng: 85.316478 }, acw: { lat: 27.706458, lng: 85.316478 } },
  { id: 'bhadrakali', name: 'Bhadrakali Mandir', cw: { lat: 27.699491, lng: 85.316465 }, acw: { lat: 27.699491, lng: 85.316465 } },
  { id: 'nac', name: 'NAC Bus Stop', cw: { lat: 27.702464, lng: 85.313506 }, acw: { lat: 27.702464, lng: 85.313506 } },

  //From Balkumari to Gopikrishna Stop-cw, from Gopikrishna to Balkumari-acw
  { id: 'parliament', name: 'Central Parliament', cw: { lat: 27.687923, lng: 85.336286 }, acw: { lat: 27.688298, lng: 85.336270 } },
  { id: 'baneshwor', name: 'Naya Baneshwor', cw: { lat: 27.690330, lng: 85.335755 }, acw: { lat: 27.690426, lng: 85.335764 } },
  { id: 'thapagaun', name: 'Thapagaun', cw: { lat: 27.691458, lng: 85.332585 }, acw: { lat: 27.691520, lng: 85.332659 } },
  { id: 'hanumanthan', name: 'Hanumanthan', cw: { lat: 27.693118, lng: 85.327594 }, acw: { lat: 27.693137, lng: 85.327739 } },
  { id: 'anamnagar', name: 'Anamnagar Bus Stop', cw: { lat: 27.699392, lng: 85.328614 }, acw: { lat: 27.699467, lng: 85.328690 } },
  { id: 'new-plaza', name: 'New Plaza', cw: { lat: 27.700670, lng: 85.323556 }, acw: { lat: 27.700716, lng: 85.323689 } },
  { id: 'dillibazar', name: 'Dillibazar', cw: { lat: 27.705782, lng: 85.322860 }, acw: { lat: 27.705784, lng: 85.322962 } },
  { id: 'narayan-gopal', name: 'Narayan Gopal Chowk', cw: { lat: 27.739940, lng: 85.336989 }, acw: { lat: 27.739742, lng: 85.337050 } },
  { id: 'gopi-krishna', name: 'Gopi Krishna Stop', cw: { lat: 27.722773, lng: 85.345382 }, acw: { lat: 27.722685, lng: 85.345028 } }

];

export const ROUTES = [
  {
    id: 'R1',
    name: 'Mahanagar Yatayat',
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
    name: 'Balaju Yatayat',
    stations: [
      'raniban', 'dhungedhara', 'banasthali', 'balaju', 'nayabazar', 'sorhakhutte', 'thamel', 'lainchaur',
      'jamal', 'ratnapark', 'bhadrakali', 'nac', // The One-Way Loop
      'lainchaur', 'thamel', 'sorhakhutte', 'nayabazar', 'balaju', 'banasthali', 'dhungedhara', 'raniban' // Heading Back
    ],
    isCircular: false,
    color: '#10b981'
  },
  {
    id: 'R3',
    name: 'Nepal Yatayat',
    stations: [
      'balkumari', 'koteshwor', 'parliament', 'baneshwor', 'thapagaun', 'hanumanthan', 
      'anamnagar', 'new-plaza', 'dillibazar', 'narayan-gopal', 'gopi-krishna'
    ],
    isCircular: false,
    color: '#3b82f6'
  }


];