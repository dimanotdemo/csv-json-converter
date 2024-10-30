import { ParsedData, HeaderConfig } from '../../types';
import { cleanValue } from './helpers';

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
      const value = cleanValue(row[index]);
      if (value !== null) {
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