import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, ApiMessage, LoginRequest, LoginResponseData, User } from '../models';

const TOKEN_KEY = 'shop_crm_token';
const USER_KEY = 'shop_crm_user';

/**
 * Mirrors auth/auth.controller.ts:
 *   POST /api/auth/login  (public)
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<User | null>(this.readUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<ApiEnvelope<LoginResponseData>> {
    return this.http
      .post<ApiEnvelope<LoginResponseData>>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((res) => {
          this.setSession(res.data.token, res.data.user);
        }),
      );
  }

  logout(): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
    );
  }

  /** Clears local session immediately without waiting on the API call. */
  logoutLocally(): void {
    this.clearSession();
  }

  me(): Observable<ApiEnvelope<User>> {
    return this.http.get<ApiEnvelope<User>>(`${this.baseUrl}/me`).pipe(
      tap((res) => this.userSignal.set(res.data)),
    );
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSignal.set(token);
    this.userSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
