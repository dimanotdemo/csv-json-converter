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
  useLastRowAsHeader: boolean;
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
  conditionalField?: string;
  conditionalName?: string;
}

// Variant and Options Types
export interface CartesianOptions {
  name: string;
  values: string[];
}

export interface VariantData {
  [key: string]: string;
}

// Add or update the type definitions
export type CSVRow = string[];
export type CSVData = CSVRow[];

// Basic JSON types
export type JsonPrimitive = string | number | boolean | null;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Helper function to convert keys to lowercase
export function toLowerKeys<T extends Record<string, unknown>>(obj: T | T[]): T | T[] {
  if (Array.isArray(obj)) {
    return obj.map(item => toLowerKeys(item) as T);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {} as Record<string, unknown>;
    Object.entries(obj).forEach(([key, value]) => {
      result[key.toLowerCase()] = value instanceof Object ? toLowerKeys(value as T) : value;
    });
    return result as T;
  }
  return obj;
}