export interface ParsedData {
  headers: string[];
  rows: string[][];
  preview: Record<string, string>[];
  originalHeaders: string[];
  secondRowHeaders: string[];
}

export interface HeaderConfig {
  headerRows: number;
  skipRows: number;
  hierarchical: boolean;
}

export interface ColumnConfig {
  originalName: string;
  mappedName: string;
  include: boolean;
  isCustom?: boolean;
  defaultValue?: string;
  isMetafield: boolean;
  metafieldNamespace: string;
  metafieldType: string;
  isOption: boolean;
  optionSeparator: string;
  injectIntoVariants?: boolean;
  variantFieldName?: string;
}