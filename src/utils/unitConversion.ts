type ConversionMap = {
  [key: string]: {
    to: { [key: string]: number };
    type: 'volume' | 'weight';
  };
};

const conversionMap: ConversionMap = {
  // Volume conversions
  'cup': { 
    to: { 
      'dl': 2.37,
      'ml': 237,
      'l': 0.237,
      'tbsp': 16,
      'tsp': 48,
      'fl oz': 8,
      'pt': 0.5,
      'qt': 0.25,
      'gal': 0.0625,
    },
    type: 'volume'
  },
  'tbsp': { 
    to: { 
      'ml': 14.79,
      'tsp': 3,
      'ss': 1,
      'cup': 0.0625,
    },
    type: 'volume'
  },
  'tsp': { 
    to: { 
      'ml': 4.93,
      'ts': 1,
      'tbsp': 0.333,
    },
    type: 'volume'
  },
  'dl': {
    to: {
      'cup': 0.422,
      'ml': 100,
      'l': 0.1,
      'fl oz': 3.381,
      'pt': 0.211,
      'qt': 0.106,
      'gal': 0.026,
    },
    type: 'volume'
  },
  'l': {
    to: {
      'ml': 1000,
      'dl': 10,
      'cup': 4.227,
      'fl oz': 33.814,
      'pt': 2.113,
      'qt': 1.057,
      'gal': 0.264,
    },
    type: 'volume'
  },
  'pt': {
    to: {
      'cup': 2,
      'fl oz': 16,
      'qt': 0.5,
      'gal': 0.125,
      'l': 0.473,
      'dl': 4.73,
      'ml': 473,
    },
    type: 'volume'
  },
  'qt': {
    to: {
      'pt': 2,
      'cup': 4,
      'fl oz': 32,
      'gal': 0.25,
      'l': 0.946,
      'dl': 9.46,
      'ml': 946,
    },
    type: 'volume'
  },
  'gal': {
    to: {
      'qt': 4,
      'pt': 8,
      'cup': 16,
      'fl oz': 128,
      'l': 3.785,
      'dl': 37.85,
      'ml': 3785,
    },
    type: 'volume'
  },
  'fl oz': {
    to: {
      'ml': 29.574,
      'dl': 0.296,
      'l': 0.0296,
      'cup': 0.125,
      'pt': 0.063,
      'qt': 0.031,
      'gal': 0.0078,
    },
    type: 'volume'
  },
  // Weight conversions
  'g': {
    to: {
      'oz': 0.035,
      'lb': 0.0022,
      'kg': 0.001,
    },
    type: 'weight'
  },
  'kg': {
    to: {
      'g': 1000,
      'oz': 35.274,
      'lb': 2.205,
    },
    type: 'weight'
  },
  'oz': {
    to: {
      'g': 28.35,
      'kg': 0.0283,
      'lb': 0.0625,
    },
    type: 'weight'
  },
  'lb': {
    to: {
      'g': 453.59,
      'kg': 0.4536,
      'oz': 16,
    },
    type: 'weight'
  },
};

const metricUnits = ['g', 'kg', 'ml', 'dl', 'l', 'ss', 'ts'];
const imperialUnits = ['oz', 'lb', 'cup', 'tbsp', 'tsp', 'fl oz', 'pt', 'qt', 'gal'];

export const isMetricUnit = (unit: string): boolean => {
  return metricUnits.includes(unit.toLowerCase());
};

export const isImperialUnit = (unit: string): boolean => {
  return imperialUnits.includes(unit.toLowerCase());
};

export const convertUnit = (amount: number, fromUnit: string, toUnit: string): number | null => {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (from === to) return amount;
  
  if (conversionMap[from] && conversionMap[from].to[to]) {
    return amount * conversionMap[from].to[to];
  }

  // Try reverse conversion if direct conversion not found
  if (conversionMap[to] && conversionMap[to].to[from]) {
    return amount / conversionMap[to].to[from];
  }

  return null;
};

export const getAlternativeUnit = (unit: string): string | null => {
  const lowerUnit = unit.toLowerCase();
  
  // Common metric to US conversions
  const alternatives: { [key: string]: string } = {
    'g': 'oz',
    'kg': 'lb',
    'ml': 'fl oz',
    'dl': 'cup',
    'l': 'qt',
    'ss': 'tbsp',
    'ts': 'tsp',
    // US to metric
    'oz': 'g',
    'lb': 'kg',
    'cup': 'dl',
    'tbsp': 'ss',
    'tsp': 'ts',
    'fl oz': 'ml',
    'qt': 'l',
    'pt': 'l',
    'gal': 'l',
  };

  return alternatives[lowerUnit] || null;
};