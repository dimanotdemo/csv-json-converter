import { ParsedData, HeaderConfig } from '@/types';

interface ParseOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  skipEmptyLines?: boolean;
}

const defaultOptions: ParseOptions = {
  delimiter: ',',
  quote: '"',
  escape: '"',
  skipEmptyLines: true,
};

export function parseCSV(content: string, config: HeaderConfig, options: ParseOptions = {}): ParsedData {
  const opts = { ...defaultOptions, ...options };

  // Pre-process to handle multiline fields
  const preprocessContent = (content: string): string => {
    let inQuotes = false;
    let buffer = '';
    
    // First normalize line endings
    const normalized = content.replace(/\r\n|\r/g, '\n');
    
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized[i];
      const nextChar = normalized[i + 1];

      if (char === opts.quote) {
        if (!inQuotes) {
          inQuotes = true;
        } else if (nextChar === opts.quote) {
          buffer += char;
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
        buffer += char;
      } else if (char === '\n' && inQuotes) {
        // Replace newlines in quoted fields with a placeholder
        buffer += '\\n';
      } else {
        buffer += char;
      }
    }
    
    return buffer;
  };

  const parseRows = (content: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    const processedContent = preprocessContent(content);
    
    let i = 0;
    while (i < processedContent.length) {
      const char = processedContent[i];
      const nextChar = processedContent[i + 1];

      if (char === opts.quote) {
        if (!inQuotes) {
          inQuotes = true;
        } else if (nextChar === opts.quote) {
          currentField += char;
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
        i++;
        continue;
      }

      if (char === opts.delimiter && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      }

      if (char === '\n' && !inQuotes) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== '')) {
          rows.push([...currentRow]);
        }
        currentRow = [];
        currentField = '';
        i++;
        continue;
      }

      currentField += char;
      i++;
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field !== '')) {
        rows.push([...currentRow]);
      }
    }

    // Post-process to restore newlines in quoted fields
    return rows.map(row => 
      row.map(field => {
        if (field.startsWith('"') && field.endsWith('"')) {
          // Remove quotes and restore newlines
          return field.slice(1, -1).replace(/\\n/g, ' ');
        }
        return field;
      })
    );
  };

  const rows = parseRows(content);
  
  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  const maxColumns = Math.max(...rows.map(row => row.length));
  
  // Clean and normalize the rows
  const normalizedRows = rows.map(row => {
    return row.map((field: string | undefined) => {
      // Handle undefined or empty fields
      if (!field) return '';
      
      // Check if the field starts and ends with quotes
      const hasWrappingQuotes = 
        field.length >= 2 && 
        field[0] === opts.quote && 
        field[field.length - 1] === opts.quote;

      // Remove wrapping quotes and preserve internal content
      if (hasWrappingQuotes) {
        return field.slice(1, -1);
      }
      return field.trim();
    }).concat(Array(maxColumns - row.length).fill(''));
  });

  const shouldSkipRow = (row: string[], rowIndex: number): boolean => {
    if (!config.skipCondition) return false;
    
    switch (config.skipCondition.type) {
      case 'empty':
        return row.every(cell => !cell.trim());
      case 'starts-with': {
        const value = config.skipCondition?.value || '';
        return row.some(cell => cell.trim().startsWith(value));
      }
      case 'contains': {
        const value = config.skipCondition?.value || '';
        return row.some(cell => cell.includes(value));
      }
      case 'number': {
        const skipCount = parseInt(config.skipCondition?.value || '0', 10);
        return rowIndex < config.headerRows + skipCount;
      }
      case 'specific': {
        if (!config.skipCondition.value) return false;
        const rowNum = rowIndex + 1;
        return config.skipCondition.value
          .split(',')
          .map(r => r.trim())
          .some(range => {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(Number);
              return rowNum >= start && rowNum <= end;
            }
            return rowNum === parseInt(range, 10);
          });
      }
      default:
        return false;
    }
  };

  const headerRows = normalizedRows.slice(0, config.headerRows);
  const dataRows = normalizedRows
    .slice(config.headerRows)
    .filter((row, index) => !shouldSkipRow(row, index + config.headerRows));

  const headers = config.hierarchical && headerRows.length > 1
    ? headerRows[0].map((header, index) => {
        const subHeader = headerRows[1][index];
        // If header is blank, use BLANK
        if (!header?.trim()) return "BLANK";
        // If we have both, combine them
        return subHeader?.trim() ? `${header} - ${subHeader}` : header;
      })
    : headerRows[0].map(header => header?.trim() || "BLANK");

  const preview = dataRows.slice(0, 5).map(row => {
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      const value = row[index];
      // Only add non-null, non-empty values
      if (value && value.toLowerCase() !== 'null' && value.trim() !== '') {
        rowData[header] = value.trim();
      }
    });
    return rowData;
  });

  return {
    headers,
    rows: dataRows,
    preview,
    originalHeaders: headerRows[0],
    secondRowHeaders: headerRows[1] || [],
  };
}
