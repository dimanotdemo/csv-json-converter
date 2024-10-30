export interface ParsedData {
  headers: string[];
  rows: string[][];
  preview: Record<string, any>[];
  originalHeaders: string[];
  secondRowHeaders: string[];
}

export interface ColumnConfig {
  originalName: string;
  mappedName: string;
  include: boolean;
  isCustom?: boolean;
  defaultValue?: string;
  isMetafield?: boolean;
  metafieldNamespace?: string;
  metafieldType?: string;
  isOption?: boolean;
  optionSeparator?: string;
  injectIntoVariants?: boolean;
  variantFieldName?: string;
}