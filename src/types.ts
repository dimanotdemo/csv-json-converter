export interface ColumnConfig {
  originalName: string;
  mappedName: string;
  include: boolean;
  combineWith: string[];
  isCustom?: boolean;
  defaultValue?: string;
  isMetafield: boolean;
  metafieldNamespace: string;
  metafieldType: string;
}

export interface CSVData {
  headers: string[];
  rows: string[][];
}