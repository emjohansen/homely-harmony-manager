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
    },
    type: 'volume'
  },
  'tbsp': { 
    to: { 
      'ml': 14.79,
      'tsp': 3,
      'ss': 1,
    },
    type: 'volume'
  },
  'tsp': { 
    to: { 
      'ml': 4.93,
      'ts': 1,
    },
    type: 'volume'
  },
  'dl': {
    to: {
      'cup': 0.422,
      'ml': 100,
      'l': 0.1,
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
  'oz': {
    to: {
      'g': 28.35,
      'kg': 0.0283,
    },
    type: 'weight'
  },
  'lb': {
    to: {
      'g': 453.59,
      'kg': 0.4536,
    },
    type: 'weight'
  },
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
  };

  return alternatives[lowerUnit] || null;
};