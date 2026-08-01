import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, DashboardSummary, Order, TopProduct } from '../models';
import { toHttpParams } from '../utils/http-params.util';

/**
 * Mirrors dashboard/dashboard.controller.ts (all endpoints are @Public()):
 *   GET /api/dashboard/summary?range=
 *   GET /api/dashboard/recent-orders?limit=
 *   GET /api/dashboard/top-products?limit=
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  summary(range = 30): Observable<ApiEnvelope<DashboardSummary>> {
    return this.http.get<ApiEnvelope<DashboardSummary>>(`${this.baseUrl}/summary`, {
      params: toHttpParams({ range }),
    });
  }

  recentOrders(limit = 10): Observable<ApiEnvelope<Order[]>> {
    return this.http.get<ApiEnvelope<Order[]>>(`${this.baseUrl}/recent-orders`, {
      params: toHttpParams({ limit }),
    });
  }

  topProducts(limit = 5): Observable<ApiEnvelope<TopProduct[]>> {
    return this.http.get<ApiEnvelope<TopProduct[]>>(`${this.baseUrl}/top-products`, {
      params: toHttpParams({ limit }),
    });
  }
}
