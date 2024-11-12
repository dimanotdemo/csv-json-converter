import { ParsedData, ColumnConfig } from '@/types';
import { CartesianOptions, VariantData } from '@/types';
import { generateVariants } from './helpers';

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
  const orderedHeaders = columnOrder || data.headers;
  
  const customColumns = Object.entries(columnConfig)
    .filter(([, config]) => config.isCustom);
  
  return data.rows.map(row => {
    const obj: JsonObject = {};
    const metafields: Metafield[] = [];
    const options: CartesianOptions[] = [];
    const variantFields: Record<string, string> = {};
    
    [...orderedHeaders, ...customColumns.map(([, config]) => config.mappedName)].forEach(header => {
      const config = columnConfig[header];
      if (!config || !config.include) return;
      
      const mappedName = config.mappedName || header;
      let value: string;
      
      if (config.isCustom) {
        value = config.defaultValue?.trim() ?? '';
      } else {
        value = row[data.headers.indexOf(header)]?.trim() ?? '';
      }
      
      if (config.injectIntoVariants) {
        if (value !== '' && value.toLowerCase() !== 'null') {
          const variantField = config.variantFieldName || mappedName;
          
          if (config.conditionalField && config.conditionalName) {
            const conditionalValue = row[data.headers.indexOf(config.conditionalField)]?.trim();
            if (conditionalValue && conditionalValue.toLowerCase() !== 'null') {
              variantFields[config.conditionalName] = value;
            } else {
              variantFields[variantField] = value;
            }
          } else {
            variantFields[variantField] = value;
          }
        }
      } else if (config.isMetafield) {
        if (value !== '' && value.toLowerCase() !== 'null') {
          metafields.push({
            key: mappedName,
            value: value,
            type: config.metafieldType,
            namespace: config.metafieldNamespace
          });
        }
      } else if (config.isOption) {
        const values = value
          .split(config.optionSeparator)
          .map(v => v.trim())
          .filter(v => v && v.toLowerCase() !== 'null');
        
        if (values.length > 0) {
          options.push({
            name: mappedName,
            values: values
          });
        }
      } else {
        if (value !== '' && value.toLowerCase() !== 'null') {
          obj[mappedName] = value;
        }
      }
    });
    
    if (options.length > 0 || Object.keys(variantFields).length > 0) {
      const variants = generateVariants(
        options,
        variantFields,
        obj.sku as string
      );
      if (variants.length > 0) {
        obj.variants = variants;
      }
    }
    
    if (metafields.length > 0) obj.metafields = metafields;
    if (options.length > 0) obj.options = options;
    
    return obj;
  }).filter(obj => Object.keys(obj).length > 0);
}