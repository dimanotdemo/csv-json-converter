// Helper function to normalize keys
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[\s-/]+/g, '_') // Replace spaces, hyphens, and forward slashes with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove any other special characters
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

// Helper function to convert keys to lowercase and replace spaces with underscores
function toLowerKeys<T extends Record<string, unknown>>(obj: T): T {
  if (Array.isArray(obj)) {
    const result = obj.map(item => 
      typeof item === 'object' && item !== null
        ? toLowerKeys(item as Record<string, unknown>)
        : item
    );
    return result as unknown as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        normalizeKey(key),
        typeof value === 'object' && value !== null
          ? toLowerKeys(value as Record<string, unknown>)
          : value
      ])
    ) as T;
  }
  
  return obj;
}

export function normalizeJson<T extends Record<string, unknown>>(json: T[]): T[] {
  return json.map(item => toLowerKeys(item));
} 