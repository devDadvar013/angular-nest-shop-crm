import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  ApiMessage,
  CreateProductRequest,
  ListProductsQuery,
  Paginated,
  Product,
  ProductStats,
  UpdateProductRequest,
} from '../models';
import { toHttpParams } from '../utils/http-params.util';

/**
 * Mirrors products/products.controller.ts:
 *   GET    /api/products           (public)
 *   GET    /api/products/stats
 *   GET    /api/products/:id       (public)
 *   POST   /api/products
 *   PUT    /api/products/:id
 *   DELETE /api/products/:id
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  list(query?: ListProductsQuery): Observable<Paginated<Product>> {
    return this.http.get<Paginated<Product>>(this.baseUrl, { params: toHttpParams(query) });
  }

  stats(): Observable<ApiEnvelope<ProductStats>> {
    return this.http.get<ApiEnvelope<ProductStats>>(`${this.baseUrl}/stats`);
  }

  findOne(id: number): Observable<ApiEnvelope<Product>> {
    return this.http.get<ApiEnvelope<Product>>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProductRequest): Observable<ApiEnvelope<Product>> {
    return this.http.post<ApiEnvelope<Product>>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateProductRequest): Observable<ApiEnvelope<Product>> {
    return this.http.put<ApiEnvelope<Product>>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.baseUrl}/${id}`);
  }
}
