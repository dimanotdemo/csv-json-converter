import { ParsedData, HeaderConfig } from '@/types';
import { cleanValue } from '@/utils/csvParser/helpers';

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
  
  // First, let's properly split the content into rows while preserving quoted content
  const parseRows = (content: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    console.log('Starting row parsing...');

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      // Handle quotes
      if (char === opts.quote) {
        if (!inQuotes) {
          inQuotes = true;
        } else if (nextChar === opts.quote) {
          currentField += char;
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
        continue;
      }

      // Handle delimiters (commas)
      if (char === opts.delimiter && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
        continue;
      }

      // Handle line breaks
      if ((char === '\n' || (char === '\r' && nextChar === '\n'))) {
        if (!inQuotes) {
          if (char === '\r') i++; // Skip \n of \r\n
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else {
          // Preserve newlines in quoted fields exactly as they are
          currentField += '\n';
        }
        continue;
      }

      currentField += char;
    }

    // Handle last field and row
    if (currentField) {
      currentRow.push(currentField.trim());
    }
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    // Debug specific fields that might contain newlines
    console.log('Fields with newlines:', rows.map((row, i) => ({
      rowIndex: i,
      fields: row.map((field, j) => ({
        columnIndex: j,
        hasNewlines: field.includes('\n'),
        content: field.includes('\n') ? field : undefined
      })).filter(f => f.hasNewlines)
    })).filter(r => r.fields.length > 0));

    return rows;
  };

  // Parse all rows
  const rows = parseRows(content);
  
  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Get the expected number of columns from the first row
  const expectedColumns = rows[0].length;
  
  // Validate and pad rows if necessary
  const normalizedRows = rows.map((row, index) => {
    if (row.length < expectedColumns) {
      console.log(`Row ${index + 1} has ${row.length} columns, expected ${expectedColumns}. Padding...`);
      return [...row, ...Array(expectedColumns - row.length).fill('')];
    }
    if (row.length > expectedColumns) {
      console.log(`Row ${index + 1} has ${row.length} columns, expected ${expectedColumns}. Truncating...`);
      return row.slice(0, expectedColumns);
    }
    return row;
  });

  const shouldSkipRow = (row: string[], rowIndex: number): boolean => {
    if (!config.skipCondition) return false;

    let skipCount: number;
    let rowNum: number;
    let ranges: string[];

    switch (config.skipCondition.type) {
      case 'empty':
        return row.every(cell => !cell.trim());
      
      case 'starts-with':
        return row.some(cell => 
          cell.trim().startsWith(config.skipCondition?.value || '')
        );
      
      case 'contains':
        return row.some(cell => 
          cell.trim().includes(config.skipCondition?.value || '')
        );
      
      case 'number':
        skipCount = parseInt(config.skipCondition?.value || '0');
        return rowIndex < config.headerRows + skipCount;
      
      case 'specific':
        if (!config.skipCondition.value) return false;
        rowNum = rowIndex + 1;
        ranges = config.skipCondition.value.split(',').map(r => r.trim());
        
        return ranges.some(range => {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            return rowNum >= start && rowNum <= end;
          }
          return rowNum === parseInt(range);
        });
      
      default:
        return false;
    }
  };

  // Process headers
  const headerRows = normalizedRows.slice(0, config.headerRows);
  
  // Filter rows based on skip conditions
  const dataRows = normalizedRows.slice(config.headerRows)
    .filter((row, index) => !shouldSkipRow(row, index + config.headerRows));

  // Process headers based on configuration
  const originalHeaders = headerRows[0];
  const secondRowHeaders = config.headerRows > 1 ? headerRows[1] : headerRows[0];
  
  const headers = config.hierarchical && headerRows.length > 1
    ? headerRows[0].map((header, index) => {
        const subHeader = headerRows[1][index];
        return subHeader ? `${header} - ${subHeader}` : header;
      })
    : config.headerRows > 1 ? headerRows[1] : headerRows[0];

  // Create preview data with special handling for multi-line content
  const preview = dataRows.slice(0, 5).map(row => {
    const rowData: Record<string, string> = {};
    headers.forEach((header, index) => {
      let value = cleanValue(row[index]);
      
      // Special handling for multi-line content
      if (value?.includes('\n')) {
        // Replace multiple newlines with single newline and trim spaces
        value = value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)  // Remove empty lines
          .join(' | ');  // Join with a separator
      }

      if (value !== null) {
        rowData[header] = value;
      }
    });
    return rowData;
  });

  return {
    headers,
    rows: dataRows,
    preview,
    originalHeaders,
    secondRowHeaders
  };
}