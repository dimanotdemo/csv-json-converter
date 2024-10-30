import { CartesianOptions, VariantData } from './types';

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
  if (options.length === 0) return [];

  const optionValues = options.map(opt => opt.values);
  const combinations = cartesianProduct(...optionValues);

  return combinations.map((combo) => {
    // Start with all variant fields
    const variant: VariantData = { ...variantFields };
    
    // Add option values (limited to 3 as per Shopify)
    combo.slice(0, 3).forEach((value, index) => {
      const cleanedValue = cleanValue(value);
      if (cleanedValue) {
        variant[`option${index + 1}`] = cleanedValue;
      }
    });
    
    // Generate SKU if needed
    if (!variant.sku && baseSku) {
      const validCombo = combo.filter(v => cleanValue(v));
      if (validCombo.length > 0) {
        variant.sku = `${baseSku}-${validCombo.join('-')}`;
      }
    }
    
    // Clean up any null values
    Object.keys(variant).forEach(key => {
      const value = variant[key];
      if (!value || (typeof value === 'string' && value.toLowerCase() === 'null')) {
        delete variant[key];
      }
    });
    
    return variant;
  }).filter(variant => Object.keys(variant).length > 0);
}

export function cleanupNullValues<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    const cleanedValue = cleanValue(value as string);
    if (cleanedValue !== null) {
      cleaned[key as keyof T] = cleanedValue as T[keyof T];
    }
  });
  return cleaned;
}