import { ParsedData, HeaderConfig, ColumnConfig } from '../types';

export function parseCSV(content: string, config: HeaderConfig): ParsedData {
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length === 0) {
    return { headers: [], rows: [], preview: [], originalHeaders: [], secondRowHeaders: [] };
  }

  const headerEndIndex = config.headerRows - 1;
  const dataStartIndex = headerEndIndex + config.skipRows + 1;

  const originalHeaders = lines[0].split(',').map(h => h.trim());
  const secondRowHeaders = config.headerRows > 1 ? 
    lines[1].split(',').map(h => h.trim()) : 
    originalHeaders;

  const headers = config.hierarchical ? 
    originalHeaders : 
    (config.headerRows > 1 ? secondRowHeaders : originalHeaders);

  const rows = lines.slice(dataStartIndex).map(line => {
    const row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    row.push(currentValue.trim());
    return row;
  });

  const preview = rows.slice(0, 5).map(row => {
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      const value = row[index]?.trim();
      if (value && value.toLowerCase() !== 'null') {
        rowData[header] = value;
      }
    });
    return rowData;
  });

  return {
    headers,
    rows,
    preview,
    originalHeaders,
    secondRowHeaders
  };
}

export function convertToJSON(data: ParsedData, columnConfig: Record<string, ColumnConfig>) {
  return data.rows.map(row => {
    const obj: Record<string, any> = {};
    const metafields: any[] = [];
    const options: { name: string; values: string[] }[] = [];
    const variantFields: Record<string, string> = {};

    // Process regular columns
    data.headers.forEach((header, index) => {
      const config = columnConfig[header];
      if (!config?.include) return;

      const value = row[index]?.trim();
      if (!value || value.toLowerCase() === 'null') return;

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
          .map(v => v.trim())
          .filter(v => v && v.toLowerCase() !== 'null');
        
        if (values.length > 0) {
          options.push({
            name: config.mappedName || header,
            values
          });
        }
      } else if (config.injectIntoVariants) {
        variantFields[config.variantFieldName || config.mappedName || header] = value;
      } else {
        obj[config.mappedName || header] = value;
      }
    });

    // Process custom columns
    Object.entries(columnConfig)
      .filter(([_, config]) => config.isCustom && config.include)
      .forEach(([header, config]) => {
        const value = config.defaultValue;
        if (!value || value.toLowerCase() === 'null') return;

        if (config.injectIntoVariants) {
          variantFields[config.variantFieldName || config.mappedName || header] = value;
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
      
        const generateVariants = (optionsList: typeof options): any[] => {
          if (optionsList.length === 0) return [];

          const cartesian = (...arrays: string[][]): string[][] => {
            return arrays.reduce((acc, array) => {
              return acc.flatMap(x => array.map(y => [...x, y]));
            }, [[]] as string[][]);
          };

          const optionValues = optionsList.map(opt => opt.values);
          const combinations = cartesian(...optionValues);

          return combinations.map((combo) => {
            // Start with all variant fields
            const variant: any = { ...variantFields };
            
            // Add option values
            combo.forEach((value, index) => {
              if (value && value.toLowerCase() !== 'null') {
                variant[`option${index + 1}`] = value;
              }
            });
            
            // Add SKU if not already present
            if (!variant.sku && obj.sku) {
              const validCombo = combo.filter(v => v && v.toLowerCase() !== 'null');
              if (validCombo.length > 0) {
                variant.sku = `${obj.sku}-${validCombo.join('-')}`;
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
          });
        };

        const variants = generateVariants(validOptions)
          .filter(variant => Object.keys(variant).length > 0);
          
        if (variants.length > 0) {
          obj.variants = variants;
        }
      }
    }

    // Final cleanup of null values
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (!value || (typeof value === 'string' && value.toLowerCase() === 'null')) {
        delete obj[key];
      }
    });

    return obj;
  }).filter(obj => Object.keys(obj).length > 0);
}