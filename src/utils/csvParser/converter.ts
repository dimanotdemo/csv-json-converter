import { ParsedData, ColumnConfig } from '@/types';
import { CartesianOptions, VariantData } from '@/types';
import { cleanValue, generateVariants, cleanupNullValues } from './helpers';

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

// Add a type guard
function isStringRecord(obj: unknown): obj is Record<string, string> {
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.values(obj).every(value => typeof value === 'string');
}

// Helper function to normalize keys
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[\s-/]+/g, '_') // Replace spaces, hyphens, and forward slashes with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove any other special characters
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

// Helper function to convert keys to lowercase and replace spaces with underscores
function toLowerKeys<T extends Record<string, unknown>>(obj: T): T {
  if (Array.isArray(obj)) {
    const result = obj.map(item => 
      typeof item === 'object' && item !== null
        ? toLowerKeys(item as Record<string, unknown>)
        : item
    );
    return result as unknown as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        normalizeKey(key),
        typeof value === 'object' && value !== null
          ? toLowerKeys(value as Record<string, unknown>)
          : value
      ])
    ) as T;
  }
  
  return obj;
}

export function convertToJSON(
  data: ParsedData,
  columnConfig: Record<string, ColumnConfig>
): JsonObject[] {
  // Helper function to detect and convert value types
  const convertValue = (value: string | null, type?: string): string | number | boolean | null => {
    if (!value || value.toLowerCase() === 'null') {
      return null;
    }

    if (type === 'number') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? value : num;
    }

    if (type === 'boolean') {
      const lowerValue = value.toLowerCase();
      if (['true', 'yes', '1', 'on'].includes(lowerValue)) return true;
      if (['false', 'no', '0', 'off'].includes(lowerValue)) return false;
      return value;
    }

    if (type === 'date') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }

    return value;
  };

  const result = data.rows.map(row => {
    const jsonObject = {} as JsonObject;
    const metafields: Metafield[] = [];
    const options: CartesianOptions[] = [];
    const variantFields: Record<string, string> = {};

    // Process each column based on configuration
    data.headers.forEach((header, index) => {
      const config = columnConfig[header];
      if (!config?.include) return;

      const value = cleanValue(row[index]);
      if (!value) return;

      // Use BLANK for empty header if it's not mapped
      const effectiveHeader = header || "BLANK";
      // Ensure mapped name is normalized
      const mappedName = normalizeKey(config.mappedName || effectiveHeader);
      
      if (config.isMetafield) {
        metafields.push({
          key: normalizeKey(mappedName),
          value: value,
          type: config.metafieldType || 'string',
          namespace: normalizeKey(config.metafieldNamespace || 'custom')
        });
      } else if (config.isOption) {
        const values = value
          .split(config.optionSeparator || ',')
          .map(v => v.trim())
          .filter(Boolean);

        if (values.length > 0) {
          options.push({
            name: mappedName,
            values: [...new Set(values)]
          });
        }
      } else if (config.injectIntoVariants) {
        variantFields[mappedName] = value;
      } else {
        jsonObject[mappedName] = convertValue(value, config.metafieldType);
      }
    });

    // Process custom columns
    Object.entries(columnConfig)
      .filter(([, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        const value = config.defaultValue;
        if (!value || value.toLowerCase() === 'null') return;

        const mappedName = (config.mappedName || header).toLowerCase();
        
        if (config.injectIntoVariants) {
          variantFields[mappedName] = value;
        } else {
          jsonObject[mappedName] = value;
        }
      });

    // Add arrays to object
    if (metafields.length > 0) {
      jsonObject.metafields = metafields;
    }

    if (options.length > 0) {
      jsonObject.options = options;
    }

    // Generate variants if options exist
    if (options.length > 0 || Object.keys(variantFields).length > 0) {
      const lowercaseVariantFields = toLowerKeys(variantFields);
      
      if (isStringRecord(lowercaseVariantFields)) {
        const variants = generateVariants(
          options,
          lowercaseVariantFields,
          (jsonObject.sku as string)?.toLowerCase()
        );
        
        if (variants.length > 0) {
          jsonObject.variants = variants.map(variant => 
            toLowerKeys(variant)
          );
        }
      }
    }

    // Convert all keys to lowercase recursively before returning
    return toLowerKeys(cleanupNullValues(jsonObject)) as JsonObject;
  });

  // Update the final conversion to use a more flexible type
  return result.map(obj => {
    const converted = toLowerKeys(cleanupNullValues(obj));
    return converted as JsonObject;
  });
}