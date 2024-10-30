import { ParsedData, ColumnConfig } from '../../types';
import { CartesianOptions } from './types';
import { cleanValue, generateVariants, cleanupNullValues } from './helpers';

export function convertToJSON(data: ParsedData, columnConfig: Record<string, ColumnConfig>) {
  return data.rows.map(row => {
    const obj: Record<string, any> = {};
    const metafields: any[] = [];
    const options: CartesianOptions[] = [];
    const variantFields: Record<string, string> = {};

    // Process regular columns
    data.headers.forEach((header, index) => {
      const config = columnConfig[header];
      if (!config?.include) return;

      const value = cleanValue(row[index]);
      if (value === null) return;

      if (config.isMetafield) {
        metafields.push({
          key: config.mappedName || header,
          value,
          type: config.metafieldType || 'single_line_text_field',
          namespace: config.metafieldNamespace || 'custom'
        });
      } else if (config.isOption) {
        const values = value
          .split(config.optionSeparator || ',')
          .map(v => cleanValue(v))
          .filter((v): v is string => v !== null);
        
        if (values.length > 0) {
          options.push({
            name: config.mappedName || header,
            values
          });
        }
      } else if (config.injectIntoVariants) {
        // Add to variant fields and DO NOT add to main object
        const fieldName = config.variantFieldName || config.mappedName || header;
        variantFields[fieldName] = value;
      } else {
        obj[config.mappedName || header] = value;
      }
    });

    // Process custom columns
    Object.entries(columnConfig)
      .filter(([_, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        const value = cleanValue(config.defaultValue);
        if (value === null) return;

        if (config.injectIntoVariants) {
          // Add to variant fields and DO NOT add to main object
          const fieldName = config.variantFieldName || config.mappedName || header;
          variantFields[fieldName] = value;
        } else {
          obj[header] = value;
        }
      });

    // Add metafields if any exist
    if (metafields.length > 0) {
      obj.metafields = metafields;
    }

    // Handle options and variants
    if (options.length > 0) {
      const validOptions = options.filter(opt => opt.values.length > 0);
      
      if (validOptions.length > 0) {
        obj.options = validOptions;
        const variants = generateVariants(validOptions, variantFields, obj.sku);
        if (variants.length > 0) {
          obj.variants = variants;
        }
      }
    }

    return cleanupNullValues(obj);
  }).filter(obj => Object.keys(obj).length > 0);
}