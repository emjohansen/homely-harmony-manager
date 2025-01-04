export type Unit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' | 'floz' | 'pint' | 'quart' | 'gallon';

export type UnitType = 'mass' | 'volume';

export const unitTypes: Record<Unit, UnitType> = {
  g: 'mass',
  kg: 'mass',
  oz: 'mass',
  lb: 'mass',
  ml: 'volume',
  l: 'volume',
  tsp: 'volume',
  tbsp: 'volume',
  cup: 'volume',
  floz: 'volume',
  pint: 'volume',
  quart: 'volume',
  gallon: 'volume'
};

const massConversions = {
  g: {
    g: 1,
    kg: 0.001,
    oz: 0.035274,
    lb: 0.002205
  },
  kg: {
    g: 1000,
    kg: 1,
    oz: 35.274,
    lb: 2.20462
  },
  oz: {
    g: 28.3495,
    kg: 0.0283495,
    oz: 1,
    lb: 0.0625
  },
  lb: {
    g: 453.592,
    kg: 0.453592,
    oz: 16,
    lb: 1
  }
};

const volumeConversions = {
  ml: {
    ml: 1,
    l: 0.001,
    tsp: 0.202884,
    tbsp: 0.067628,
    cup: 0.004227,
    floz: 0.033814,
    pint: 0.002113,
    quart: 0.001057,
    gallon: 0.000264
  },
  l: {
    ml: 1000,
    l: 1,
    tsp: 202.884,
    tbsp: 67.628,
    cup: 4.22675,
    floz: 33.814,
    pint: 2.11338,
    quart: 1.05669,
    gallon: 0.264172
  },
  tsp: {
    ml: 4.92892,
    l: 0.00492892,
    tsp: 1,
    tbsp: 0.333333,
    cup: 0.0208333,
    floz: 0.166667,
    pint: 0.0104167,
    quart: 0.00520833,
    gallon: 0.00130208
  },
  tbsp: {
    ml: 14.7868,
    l: 0.0147868,
    tsp: 3,
    tbsp: 1,
    cup: 0.0625,
    floz: 0.5,
    pint: 0.03125,
    quart: 0.015625,
    gallon: 0.00390625
  },
  cup: {
    ml: 236.588,
    l: 0.236588,
    tsp: 48,
    tbsp: 16,
    cup: 1,
    floz: 8,
    pint: 0.5,
    quart: 0.25,
    gallon: 0.0625
  },
  floz: {
    ml: 29.5735,
    l: 0.0295735,
    tsp: 6,
    tbsp: 2,
    cup: 0.125,
    floz: 1,
    pint: 0.0625,
    quart: 0.03125,
    gallon: 0.0078125
  },
  pint: {
    ml: 473.176,
    l: 0.473176,
    tsp: 96,
    tbsp: 32,
    cup: 2,
    floz: 16,
    pint: 1,
    quart: 0.5,
    gallon: 0.125
  },
  quart: {
    ml: 946.353,
    l: 0.946353,
    tsp: 192,
    tbsp: 64,
    cup: 4,
    floz: 32,
    pint: 2,
    quart: 1,
    gallon: 0.25
  },
  gallon: {
    ml: 3785.41,
    l: 3.78541,
    tsp: 768,
    tbsp: 256,
    cup: 16,
    floz: 128,
    pint: 8,
    quart: 4,
    gallon: 1
  }
};

export const isMetricUnit = (unit: string): boolean => {
  return ['g', 'kg', 'ml', 'l'].includes(unit);
};

export const isImperialUnit = (unit: string): boolean => {
  return ['oz', 'lb', 'tsp', 'tbsp', 'cup', 'floz', 'pint', 'quart', 'gallon'].includes(unit);
};

export const getAlternativeUnit = (unit: string): string | null => {
  const conversions: Record<string, string> = {
    'g': 'oz',
    'oz': 'g',
    'kg': 'lb',
    'lb': 'kg',
    'ml': 'floz',
    'floz': 'ml',
    'l': 'quart',
    'quart': 'l'
  };
  return conversions[unit] || null;
};

export const convertUnits = (value: number, fromUnit: Unit, toUnit: Unit): number | null => {
  if (fromUnit === toUnit) return value;
  
  const fromType = unitTypes[fromUnit];
  const toType = unitTypes[toUnit];
  
  if (fromType !== toType) {
    return null;
  }
  
  const conversions = fromType === 'mass' ? massConversions : volumeConversions;
  
  if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) {
    return null;
  }
  
  return value * conversions[fromUnit][toUnit];
};