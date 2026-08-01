import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  ApiMessage,
  CreateOrderRequest,
  ListOrdersQuery,
  Order,
  OrderStats,
  OrderStatusOption,
  Paginated,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
} from '../models';
import { toHttpParams } from '../utils/http-params.util';

/**
 * Mirrors orders/orders.controller.ts:
 *   GET    /api/orders
 *   GET    /api/orders/statuses/list  (public)
 *   GET    /api/orders/stats
 *   GET    /api/orders/:id
 *   POST   /api/orders
 *   PUT    /api/orders/:id
 *   PATCH  /api/orders/:id/status
 *   DELETE /api/orders/:id
 */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  list(query?: ListOrdersQuery): Observable<Paginated<Order>> {
    return this.http.get<Paginated<Order>>(this.baseUrl, { params: toHttpParams(query) });
  }

  statuses(): Observable<OrderStatusOption[]> {
    return this.http.get<OrderStatusOption[]>(`${this.baseUrl}/statuses/list`);
  }

  stats(): Observable<ApiEnvelope<OrderStats>> {
    return this.http.get<ApiEnvelope<OrderStats>>(`${this.baseUrl}/stats`);
  }

  findOne(id: number): Observable<ApiEnvelope<Order>> {
    return this.http.get<ApiEnvelope<Order>>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateOrderRequest): Observable<ApiEnvelope<Order>> {
    return this.http.post<ApiEnvelope<Order>>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateOrderRequest): Observable<ApiEnvelope<Order>> {
    return this.http.put<ApiEnvelope<Order>>(`${this.baseUrl}/${id}`, dto);
  }

  updateStatus(id: number, dto: UpdateOrderStatusRequest): Observable<ApiEnvelope<Order>> {
    return this.http.patch<ApiEnvelope<Order>>(`${this.baseUrl}/${id}/status`, dto);
  }

  remove(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.baseUrl}/${id}`);
  }
}
