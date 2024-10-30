// CSV Data Types
export interface ParsedData {
  headers: string[];
  rows: string[][];
  preview: Record<string, string>[];
  originalHeaders: string[];
  secondRowHeaders: string[];
}

export interface SkipCondition {
  type: 'empty' | 'starts-with' | 'contains' | 'number' | 'specific';
  value?: string;
}

export interface HeaderConfig {
  headerRows: number;
  skipRows: number;
  hierarchical: boolean;
  skipCondition?: SkipCondition;
}

// Column Configuration Types
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

// Variant and Options Types
export interface CartesianOptions {
  name: string;
  values: string[];
}

export interface VariantData {
  [key: string]: string;
}