import { CartesianOptions, VariantData } from '@/types';

interface ValueType {
  string: string;
  number: number;
  boolean: boolean;
  date: string;
}

interface Metafield {
  key: string;
  value: string;
  type: string;
  namespace: string;
}

type BaseJsonValue = string | number | boolean | null;
type ArrayTypes = Metafield[] | CartesianOptions[] | VariantData[];

interface JsonObject {
  metafields?: Metafield[];
  options?: CartesianOptions[];
  variants?: VariantData[];
  [key: string]: BaseJsonValue | ArrayTypes | undefined;
}

export function cleanValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.toLowerCase() === 'null' ? null : trimmed;
}

export function cartesianProduct(...arrays: string[][]): string[][] {
  return arrays.reduce((acc, array) => {
    return acc.flatMap(x => array.map(y => [...x, y]));
  }, [[]] as string[][]);
}

export function generateVariants(
  options: CartesianOptions[],
  variantFields: Record<string, string>,
  baseSku?: string
): VariantData[] {
  if (options.length === 0) {
    return [{ ...variantFields }];
  }

  const optionValues = options.map(opt => opt.values);
  const combinations = cartesianProduct(...optionValues);

  return combinations.map((combo) => {
    const variant: VariantData = { ...variantFields };
    
    combo.forEach((value, index) => {
      if (value && value.toLowerCase() !== 'null') {
        variant[`option${index + 1}`] = value;
      }
    });
    
    if (baseSku) {
      const validCombo = combo.filter(v => v && v.toLowerCase() !== 'null');
      if (validCombo.length > 0) {
        variant.sku = `${baseSku}-${validCombo.join('-')}`;
      } else {
        variant.sku = baseSku;
      }
    }
    
    return variant;
  });
}

export function cleanupNullValues(obj: JsonObject): JsonObject {
  const result = Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      return acc;
    }
    
    if (Array.isArray(value)) {
      if (value.length > 0) {
        acc[key] = value;
      }
      return acc;
    }
    
    if (typeof value === 'object' && value !== null) {
      return acc;
    }
    
    acc[key] = value as BaseJsonValue;
    return acc;
  }, {} as JsonObject);

  return result;
}

export function detectValueType(value: string): keyof ValueType {
  if (/^-?\d*\.?\d+$/.test(value)) {
    return 'number';
  }

  const lowerValue = value.toLowerCase();
  if (['true', 'false', 'yes', 'no', '1', '0'].includes(lowerValue)) {
    return 'boolean';
  }

  const date = new Date(value);
  if (!isNaN(date.getTime()) && value.includes('-')) {
    return 'date';
  }

  return 'string';
}

export function formatValue(value: string, type: keyof ValueType): ValueType[keyof ValueType] {
  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return ['true', 'yes', '1'].includes(value.toLowerCase());
    case 'date':
      return new Date(value).toISOString();
    default:
      return value;
  }
}