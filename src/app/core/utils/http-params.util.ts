import { HttpParams } from '@angular/common/http';

/**
 * Builds HttpParams from a plain object, skipping undefined/null/empty-string
 * values so optional query params (search, filters, pagination) are only
 * sent when the caller actually set them - mirrors how the Nest DTOs treat
 * missing query keys as "not provided".
 */
export function toHttpParams<T extends object>(query: T | undefined): HttpParams {
  let params = new HttpParams();
  if (!query) return params;
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}
