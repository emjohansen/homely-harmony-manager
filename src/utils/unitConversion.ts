export const convertTemperature = (value: number, from: 'C' | 'F', to: 'C' | 'F'): number => {
  if (from === to) return value;
  if (from === 'C' && to === 'F') {
    return (value * 9/5) + 32;
  }
  return (value - 32) * 5/9;
};

export const convertVolume = (value: number, from: string, to: string): number => {
  const mlConversions: { [key: string]: number } = {
    'ml': 1,
    'l': 1000,
    'dl': 100,
    'cup': 236.588,
    'tbsp': 14.787,
    'tsp': 4.929
  };

  if (!(from in mlConversions) || !(to in mlConversions)) {
    throw new Error('Invalid volume unit');
  }

  const mlValue = value * mlConversions[from];
  return mlValue / mlConversions[to];
};

export const convertWeight = (value: number, from: string, to: string): number => {
  const gConversions: { [key: string]: number } = {
    'g': 1,
    'kg': 1000,
    'oz': 28.3495,
    'lb': 453.592
  };

  if (!(from in gConversions) || !(to in gConversions)) {
    throw new Error('Invalid weight unit');
  }

  const gValue = value * gConversions[from];
  return gValue / gConversions[to];
};

export const convertPieces = (value: number, from: string, to: string): number => {
  if (from !== 'piece' && from !== 'pieces') throw new Error('Invalid piece unit');
  if (to !== 'piece' && to !== 'pieces') throw new Error('Invalid piece unit');
  return value;
};

export const convert = (value: number, from: string, to: string): number => {
  const fromUnit = from.toLowerCase();
  const toUnit = to.toLowerCase();

  if (fromUnit === toUnit) return value;

  for (const [type, units] of Object.entries(unitGroups)) {
    if (units.includes(fromUnit as any) && units.includes(toUnit as any)) {
      switch (type) {
        case 'volume':
          return convertVolume(value, fromUnit, toUnit);
        case 'weight':
          return convertWeight(value, fromUnit, toUnit);
        case 'piece':
          return convertPieces(value, fromUnit, toUnit);
        case 'temperature':
          return convertTemperature(value, fromUnit as 'C' | 'F', toUnit as 'C' | 'F');
      }
    }
  }

  throw new Error('Incompatible units');
};

export const roundToDecimalPlaces = (value: number, places: number): number => {
  const multiplier = Math.pow(10, places);
  return Math.round(value * multiplier) / multiplier;
};

const unitGroups = {
  volume: ['ml', 'l', 'cup', 'tbsp', 'tsp', 'dl'],
  weight: ['g', 'kg', 'oz', 'lb'],
  piece: ['piece', 'pieces'],
  temperature: ['C', 'F']
} as const;

export const getUnitType = (unit: string): string | null => {
  const normalizedUnit = unit.toLowerCase();
  for (const [type, units] of Object.entries(unitGroups)) {
    if (units.includes(normalizedUnit as any)) {
      return type;
    }
  }
  return null;
};

export const canConvert = (from: string, to: string): boolean => {
  const fromType = getUnitType(from);
  const toType = getUnitType(to);
  return fromType !== null && fromType === toType;
};

export const formatValue = (value: number, unit: string): string => {
  const roundedValue = roundToDecimalPlaces(value, 2);
  return `${roundedValue} ${unit}`;
};