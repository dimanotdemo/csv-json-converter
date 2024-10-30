export interface CartesianOptions {
  name: string;
  values: string[];
}

// Make VariantData more flexible - allow any string fields
export interface VariantData {
  [key: string]: string;
}