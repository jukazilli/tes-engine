export interface PageResponse<T> {
  items: T[];
  nextCursor?: string;
}

export interface ReferenceOption {
  code: string;
  label: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}
