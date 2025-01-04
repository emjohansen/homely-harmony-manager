type Unit = 'g' | 'kg' | 'oz' | 'lb' | 'ml' | 'l' | 'fl oz' | 'cup' | 'tbsp' | 'tsp';

const metricUnits = ['g', 'kg', 'ml', 'l'];
const imperialUnits = ['oz', 'lb', 'fl oz', 'cup', 'tbsp', 'tsp'];

const conversionFactors: Record<Unit, Record<Unit, number>> = {
  'g': {
    'g': 1,
    'kg': 0.001,
    'oz': 0.035274,
    'lb': 0.002205,
    'ml': 1,
    'l': 0.001,
    'fl oz': 0.033814,
    'cup': 0.004227,
    'tbsp': 0.067628,
    'tsp': 0.202884
  },
  'kg': {
    'g': 1000,
    'kg': 1,
    'oz': 35.274,
    'lb': 2.20462,
    'ml': 1000,
    'l': 1,
    'fl oz': 33.814,
    'cup': 4.22675,
    'tbsp': 67.628,
    'tsp': 202.884
  },
  'oz': {
    'g': 28.3495,
    'kg': 0.0283495,
    'oz': 1,
    'lb': 0.0625,
    'ml': 29.5735,
    'l': 0.0295735,
    'fl oz': 1,
    'cup': 0.125,
    'tbsp': 2,
    'tsp': 6
  },
  'lb': {
    'g': 453.592,
    'kg': 0.453592,
    'oz': 16,
    'lb': 1,
    'ml': 453.592,
    'l': 0.453592,
    'fl oz': 15.9996,
    'cup': 2.20462,
    'tbsp': 35.274,
    'tsp': 105.822
  },
  'ml': {
    'g': 1,
    'kg': 0.001,
    'oz': 0.033814,
    'lb': 0.002205,
    'ml': 1,
    'l': 0.001,
    'fl oz': 0.033814,
    'cup': 0.004227,
    'tbsp': 0.067628,
    'tsp': 0.202884
  },
  'l': {
    'g': 1000,
    'kg': 1,
    'oz': 33.814,
    'lb': 2.20462,
    'ml': 1000,
    'l': 1,
    'fl oz': 33.814,
    'cup': 4.22675,
    'tbsp': 67.628,
    'tsp': 202.884
  },
  'fl oz': {
    'g': 29.5735,
    'kg': 0.0295735,
    'oz': 1,
    'lb': 0.0625,
    'ml': 29.5735,
    'l': 0.0295735,
    'fl oz': 1,
    'cup': 0.125,
    'tbsp': 2,
    'tsp': 6
  },
  'cup': {
    'g': 236.588,
    'kg': 0.236588,
    'oz': 8,
    'lb': 0.5,
    'ml': 236.588,
    'l': 0.236588,
    'fl oz': 8,
    'cup': 1,
    'tbsp': 16,
    'tsp': 48
  },
  'tbsp': {
    'g': 14.7868,
    'kg': 0.0147868,
    'oz': 0.5,
    'lb': 0.03125,
    'ml': 14.7868,
    'l': 0.0147868,
    'fl oz': 0.5,
    'cup': 0.0625,
    'tbsp': 1,
    'tsp': 3
  },
  'tsp': {
    'g': 4.92892,
    'kg': 0.00492892,
    'oz': 0.166667,
    'lb': 0.0104167,
    'ml': 4.92892,
    'l': 0.00492892,
    'fl oz': 0.166667,
    'cup': 0.0208333,
    'tbsp': 0.0625,
    'tsp': 1
  }
};

export const isMetricUnit = (unit: string): boolean => {
  return metricUnits.includes(unit);
};

export const isImperialUnit = (unit: string): boolean => {
  return imperialUnits.includes(unit);
};

export const convertUnit = (value: number, fromUnit: Unit, toUnit: Unit): number => {
  if (fromUnit === toUnit) return value;
  if (!conversionFactors[fromUnit] || !conversionFactors[fromUnit][toUnit]) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
  return value * conversionFactors[fromUnit][toUnit];
};

export const getAlternativeUnit = (unit: Unit): Unit | null => {
  const metricToImperial: Record<Unit, Unit> = {
    'g': 'oz',
    'kg': 'lb',
    'ml': 'fl oz',
    'l': 'cup',
    'oz': 'g',
    'lb': 'kg',
    'fl oz': 'ml',
    'cup': 'l',
    'tbsp': 'ml',
    'tsp': 'ml'
  };
  
  return metricToImperial[unit] || null;
};
