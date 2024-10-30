import { ParsedData, ColumnConfig } from '@/types';
import { CartesianOptions, VariantData } from '@/types';
import { cleanValue, generateVariants, cleanupNullValues } from './helpers';

interface ConversionOptions {
  dateFormat?: string;
  numberFormat?: string;
  booleanTrueValues?: string[];
  booleanFalseValues?: string[];
  nullValues?: string[];
}

const defaultOptions: ConversionOptions = {
  dateFormat: 'YYYY-MM-DD',
  numberFormat: '.',
  booleanTrueValues: ['true', 'yes', '1', 'on'],
  booleanFalseValues: ['false', 'no', '0', 'off'],
  nullValues: ['null', 'undefined', 'nil', ''],
};

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

export function convertToJSON(
  data: ParsedData,
  columnConfig: Record<string, ColumnConfig>,
  options: ConversionOptions = {}
): JsonObject[] {
  const opts = { ...defaultOptions, ...options };

  // Helper function to detect and convert value types
  const convertValue = (value: string | null, type?: string): string | number | boolean | null => {
    if (!value || opts.nullValues?.includes(value.toLowerCase())) {
      return null;
    }

    if (type === 'number') {
      const num = parseFloat(value.replace(',', '.'));
      return isNaN(num) ? value : num;
    }

    if (type === 'boolean') {
      const lowerValue = value.toLowerCase();
      if (opts.booleanTrueValues?.includes(lowerValue)) return true;
      if (opts.booleanFalseValues?.includes(lowerValue)) return false;
      return value;
    }

    if (type === 'date') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString();
    }

    return value;
  };

  return data.rows.map(row => {
    const jsonObject = {} as JsonObject;
    const metafields: Metafield[] = [];
    const options: CartesianOptions[] = [];
    const variantFields: Record<string, string> = {};

    // Process each column based on configuration
    data.headers.forEach((header, index) => {
      const config = columnConfig[header];
      if (!config?.include) return;

      const value = cleanValue(row[index]);
      
      if (config.isMetafield && value) {
        metafields.push({
          key: config.mappedName.toLowerCase().replace(/\s+/g, '_'),
          value: value,
          type: config.metafieldType || 'string',
          namespace: config.metafieldNamespace || 'custom'
        });
      } else if (config.isOption && value) {
        const values = value
          .split(config.optionSeparator || ',')
          .map(v => v.trim())
          .filter(Boolean);

        if (values.length > 0) {
          options.push({
            name: config.mappedName,
            values: [...new Set(values)] // Remove duplicates
          });
        }
      } else if (config.injectIntoVariants && value) {
        variantFields[config.variantFieldName || config.mappedName] = value;
      } else if (value !== null) {
        jsonObject[config.mappedName] = convertValue(value, config.metafieldType);
      }
    });

    // Add metafields if any exist
    if (metafields.length > 0) {
      jsonObject.metafields = metafields;
    }

    // Add options if any exist
    if (options.length > 0) {
      jsonObject.options = options;
    }

    // Generate variants if options exist
    if (options.length > 0 || Object.keys(variantFields).length > 0) {
      const variants = generateVariants(options, variantFields, jsonObject.sku as string);
      if (variants.length > 0) {
        jsonObject.variants = variants;
      }
    }

    return cleanupNullValues(jsonObject) as JsonObject;
  });
}