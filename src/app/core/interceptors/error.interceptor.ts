import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Mirrors the frontend's `extractErrorMessage` helper referenced in the
 * backend README: reads `{ message, errors }` from AllExceptionsFilter's
 * error body and surfaces a readable message via the toast service.
 * On 401, clears the local session and redirects to /login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const body = err.error as { message?: string; errors?: Record<string, string[]> } | null;
        const message = extractErrorMessage(body, err.statusText);

        if (err.status === 401) {
          auth.logoutLocally();
          if (!router.url.startsWith('/login')) {
            router.navigate(['/login']);
          }
        }

        toast.error(message);
      } else {
        toast.error('خطای غیرمنتظره‌ای رخ داد.');
      }
      return throwError(() => err);
    }),
  );
};

function extractErrorMessage(
  body: { message?: string; errors?: Record<string, string[]> } | null,
  fallback: string,
): string {
  if (!body) return fallback || 'خطایی رخ داد.';
  if (body.errors) {
    const firstField = Object.keys(body.errors)[0];
    const firstMessage = firstField ? body.errors[firstField]?.[0] : undefined;
    return firstMessage ?? body.message ?? 'اطلاعات ارسالی نامعتبر است.';
  }
  return body.message ?? fallback ?? 'خطایی رخ داد.';
}
