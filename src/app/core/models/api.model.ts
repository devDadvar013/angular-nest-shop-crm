/**
 * Matches the backend's TransformInterceptor, which wraps every response
 * in `{ data: ... }`, and AllExceptionsFilter's Laravel-style error shape.
 */
export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface ApiMessage {
  message: string;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

/** Matches common/paginated.ts -> PaginatedResult<T> */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links?: PaginationLinks;
}

/** Matches common/pagination.dto.ts -> PaginationQueryDto */
export interface PaginationQuery {
  page?: number;
  per_page?: number;
}

/** Matches AllExceptionsFilter's ErrorBody shape. */
export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}
