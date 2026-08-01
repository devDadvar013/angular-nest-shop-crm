import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  ApiMessage,
  CreateCustomerRequest,
  Customer,
  ListCustomersQuery,
  Paginated,
  UpdateCustomerRequest,
} from '../models';
import { toHttpParams } from '../utils/http-params.util';

/**
 * Mirrors customers/customers.controller.ts:
 *   GET    /api/customers
 *   GET    /api/customers/:id
 *   POST   /api/customers
 *   PUT    /api/customers/:id
 *   DELETE /api/customers/:id
 */
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  constructor(private readonly http: HttpClient) {}

  list(query?: ListCustomersQuery): Observable<Paginated<Customer>> {
    return this.http.get<Paginated<Customer>>(this.baseUrl, { params: toHttpParams(query) });
  }

  findOne(id: number): Observable<ApiEnvelope<Customer>> {
    return this.http.get<ApiEnvelope<Customer>>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateCustomerRequest): Observable<ApiEnvelope<Customer>> {
    return this.http.post<ApiEnvelope<Customer>>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateCustomerRequest): Observable<ApiEnvelope<Customer>> {
    return this.http.put<ApiEnvelope<Customer>>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.baseUrl}/${id}`);
  }
}
