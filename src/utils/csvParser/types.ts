export interface CartesianOptions {
  name: string;
  values: string[];
}

export interface VariantData {
  [key: string]: string | number;
  option1?: string;
  option2?: string;
  option3?: string;
  price?: string;
  compare_at_price?: string;
  sku?: string;
}