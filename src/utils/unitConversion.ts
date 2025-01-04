export const UNIT_CONVERSIONS: { [key: string]: { [key: string]: number } } = {
  // Volume conversions
  ml: {
    l: 0.001,
    dl: 0.01,
    cl: 0.1,
    ml: 1,
    tsp: 0.202884,
    tbsp: 0.067628,
    cup: 0.004227,
    floz: 0.033814,
    pint: 0.001761,
    quart: 0.00088,
    gallon: 0.00022
  },
  l: {
    l: 1,
    dl: 10,
    cl: 100,
    ml: 1000,
    tsp: 202.884,
    tbsp: 67.628,
    cup: 4.227,
    floz: 33.814,
    pint: 1.761,
    quart: 0.88,
    gallon: 0.22
  },
  dl: {
    l: 0.1,
    dl: 1,
    cl: 10,
    ml: 100,
    tsp: 20.2884,
    tbsp: 6.7628,
    cup: 0.4227,
    floz: 3.3814,
    pint: 0.1761,
    quart: 0.088,
    gallon: 0.022
  },
  cl: {
    l: 0.01,
    dl: 0.1,
    cl: 1,
    ml: 10,
    tsp: 2.02884,
    tbsp: 0.67628,
    cup: 0.04227,
    floz: 0.33814,
    pint: 0.01761,
    quart: 0.0088,
    gallon: 0.0022
  },
  tsp: {
    l: 0.00492892,
    dl: 0.0492892,
    cl: 0.492892,
    ml: 4.92892,
    tsp: 1,
    tbsp: 0.333333,
    cup: 0.0208333,
    floz: 0.166667,
    pint: 0.00868056,
    quart: 0.00434028,
    gallon: 0.00108507
  },
  tbsp: {
    l: 0.0147868,
    dl: 0.147868,
    cl: 1.47868,
    ml: 14.7868,
    tsp: 3,
    tbsp: 1,
    cup: 0.0625,
    floz: 0.5,
    pint: 0.0260417,
    quart: 0.0130208,
    gallon: 0.00325521
  },
  cup: {
    l: 0.236588,
    dl: 2.36588,
    cl: 23.6588,
    ml: 236.588,
    tsp: 48,
    tbsp: 16,
    cup: 1,
    floz: 8,
    pint: 0.416667,
    quart: 0.208333,
    gallon: 0.0520833
  },
  floz: {
    l: 0.0295735,
    dl: 0.295735,
    cl: 2.95735,
    ml: 29.5735,
    tsp: 6,
    tbsp: 2,
    cup: 0.125,
    floz: 1,
    pint: 0.0520833,
    quart: 0.0260417,
    gallon: 0.00651042
  },
  pint: {
    l: 0.473176,
    dl: 4.73176,
    cl: 47.3176,
    ml: 473.176,
    tsp: 96,
    tbsp: 32,
    cup: 2,
    floz: 16,
    pint: 1,
    quart: 0.5,
    gallon: 0.125
  },
  quart: {
    l: 0.946353,
    dl: 9.46353,
    cl: 94.6353,
    ml: 946.353,
    tsp: 192,
    tbsp: 64,
    cup: 4,
    floz: 32,
    pint: 2,
    quart: 1,
    gallon: 0.25
  },
  gallon: {
    l: 3.78541,
    dl: 37.8541,
    cl: 378.541,
    ml: 3785.41,
    tsp: 768,
    tbsp: 256,
    cup: 16,
    floz: 128,
    pint: 8,
    quart: 4,
    gallon: 1
  },
  // Weight conversions
  g: {
    kg: 0.001,
    g: 1,
    mg: 1000,
    oz: 0.035274,
    lb: 0.00220462
  },
  kg: {
    kg: 1,
    g: 1000,
    mg: 1000000,
    oz: 35.274,
    lb: 2.20462
  },
  mg: {
    kg: 0.000001,
    g: 0.001,
    mg: 1,
    oz: 0.000035274,
    lb: 0.00000220462
  },
  oz: {
    kg: 0.0283495,
    g: 28.3495,
    mg: 28349.5,
    oz: 1,
    lb: 0.0625
  },
  lb: {
    kg: 0.453592,
    g: 453.592,
    mg: 453592,
    oz: 16,
    lb: 1
  }
};

export const convertUnit = (value: number, fromUnit: string, toUnit: string): number | null => {
  if (fromUnit === toUnit) return value;
  
  if (UNIT_CONVERSIONS[fromUnit] && UNIT_CONVERSIONS[fromUnit][toUnit]) {
    return value * UNIT_CONVERSIONS[fromUnit][toUnit];
  }
  
  return null;
};

export const isCompatibleUnit = (fromUnit: string, toUnit: string): boolean => {
  if (fromUnit === toUnit) return true;
  return !!(UNIT_CONVERSIONS[fromUnit] && UNIT_CONVERSIONS[fromUnit][toUnit]);
};

// Add the missing functions
export const isMetricUnit = (unit: string): boolean => {
  const metricUnits = ['ml', 'l', 'dl', 'cl', 'g', 'kg', 'mg'];
  return metricUnits.includes(unit);
};

export const isImperialUnit = (unit: string): boolean => {
  const imperialUnits = ['oz', 'lb', 'cup', 'floz', 'pint', 'quart', 'gallon', 'tsp', 'tbsp'];
  return imperialUnits.includes(unit);
};

export const getAlternativeUnit = (unit: string): string | null => {
  // Metric to Imperial conversions
  const metricToImperial: { [key: string]: string } = {
    'ml': 'floz',
    'l': 'gallon',
    'dl': 'cup',
    'g': 'oz',
    'kg': 'lb'
  };

  // Imperial to Metric conversions
  const imperialToMetric: { [key: string]: string } = {
    'floz': 'ml',
    'gallon': 'l',
    'cup': 'dl',
    'oz': 'g',
    'lb': 'kg',
    'pint': 'ml',
    'quart': 'l',
    'tsp': 'ml',
    'tbsp': 'ml'
  };

  if (isMetricUnit(unit)) {
    return metricToImperial[unit] || null;
  }
  
  if (isImperialUnit(unit)) {
    return imperialToMetric[unit] || null;
  }

  return null;
};
