import { ParsedData, ColumnConfig } from '@/types';
import { CartesianOptions, VariantData } from '@/types';
import { cleanValue, generateVariants } from './helpers';

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
  columnOrder?: string[]
): JsonObject[] {
  // Use columnOrder if provided, otherwise use the original order
  const orderedHeaders = columnOrder || data.headers;
  
  return data.preview.map(row => {
    const obj: JsonObject = {};
    const metafields: Metafield[] = [];
    const options: CartesianOptions[] = [];
    let variants: VariantData[] = [];
    
    // Process headers in the specified order
    orderedHeaders.forEach(header => {
      const config = columnConfig[header];
      if (!config || !config.include) return;
      
      const value = cleanValue(row[header]);
      
      if (config.isMetafield && value !== null) {
        metafields.push({
          key: config.mappedName,
          value: value,
          type: config.metafieldType,
          namespace: config.metafieldNamespace
        });
      } else if (config.isOption && value !== null) {
        const values = value.split(config.optionSeparator).map(v => v.trim()).filter(Boolean);
        if (values.length > 0) {
          options.push({
            name: config.mappedName,
            values: values
          });
        }
      } else if (config.injectIntoVariants) {
        // Generate variants only if value is not null
        const variantField = config.variantFieldName || config.mappedName;
        if (value !== null) {
          // Pass both required arguments to generateVariants with correct types
          variants = generateVariants(
            [{ name: variantField, values: [value] }], // cartesianOptions
            { [variantField]: value } // variantFields as Record<string, string>
          );
        }
      } else {
        obj[config.mappedName] = value;
      }
    });
    
    // Add arrays only if they have items
    if (metafields.length > 0) obj.metafields = metafields;
    if (options.length > 0) obj.options = options;
    if (variants.length > 0) obj.variants = variants;
    
    return obj;
  }).filter(obj => Object.keys(obj).length > 0);
}