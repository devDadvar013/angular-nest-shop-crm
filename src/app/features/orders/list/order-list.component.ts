import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { ListOrdersQuery, Order, OrderStats, OrderStatus, OrderStatusOption, Paginated } from '../../../core/models';
import { TomanPipe } from '../../../shared/pipes/toman.pipe';
import { FaDatePipe } from '../../../shared/pipes/fa-date.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TomanPipe, FaDatePipe, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-ink-900">سفارش‌ها</h1>
          <p class="mt-1 text-sm text-ink-500">مدیریت و پیگیری سفارش‌های مشتریان</p>
        </div>
        <a routerLink="/orders/new" class="btn-primary">
          <span class="text-lg leading-none">+</span>
          <span>سفارش جدید</span>
        </a>
      </div>

      @if (stats(); as st) {
        <div class="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div class="stat-card text-brand-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">تعداد کل سفارش‌ها</span>
              <span class="text-lg">🧾</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-ink-900">{{ st.total.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="stat-card text-amber-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">در انتظار</span>
              <span class="text-lg">⏳</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-amber-600">{{ st.pending.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="stat-card text-emerald-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">درآمد کل</span>
              <span class="text-lg">💰</span>
            </div>
            <p class="mt-2 text-xl font-bold text-emerald-600">{{ st.revenue | toman }}</p>
          </div>
          <div class="stat-card text-indigo-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">سفارش‌های امروز</span>
              <span class="text-lg">📅</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-indigo-600">{{ st.today.toLocaleString('fa-IR') }}</p>
          </div>
        </div>
      }

      <div class="card p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label class="field-label">جستجو (شماره سفارش)</label>
            <input class="field-input" placeholder="ORD-20260101-0001" [(ngModel)]="search" (ngModelChange)="onFilterChange()" />
          </div>
          <div class="sm:w-56">
            <label class="field-label">وضعیت</label>
            <select class="field-input" [(ngModel)]="status" (ngModelChange)="onFilterChange()">
              <option [ngValue]="undefined">همه</option>
              @for (opt of statusOptions(); track opt.value) {
                <option [ngValue]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-sm text-ink-400">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"></div>
            <p class="mt-3">در حال بارگذاری...</p>
          </div>
        } @else if (page()?.data?.length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <span class="text-5xl">📋</span>
            <p class="mt-3 text-sm text-ink-500">سفارشی یافت نشد.</p>
          </div>
        } @else {
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-ink-100 bg-ink-50/60 text-right text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">شماره سفارش</th>
                  <th class="px-4 py-3 font-semibold">مشتری</th>
                  <th class="px-4 py-3 font-semibold">مبلغ</th>
                  <th class="px-4 py-3 font-semibold">وضعیت</th>
                  <th class="px-4 py-3 font-semibold">تاریخ</th>
                  <th class="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (o of page()?.data; track o.id) {
                  <tr class="hover:bg-ink-50/50 transition-colors">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/orders', o.id]" class="font-mono text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline">
                        {{ o.order_number }}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-ink-600">{{ o.customer?.name ?? 'مشتری حذف‌شده' }}</td>
                    <td class="px-4 py-3 font-medium text-ink-800">{{ o.total_amount | toman }}</td>
                    <td class="px-4 py-3"><app-status-badge [status]="o.status" [label]="o.status_label" /></td>
                    <td class="px-4 py-3 text-ink-500">{{ o.created_at | faDate }}</td>
                    <td class="px-4 py-3">
                      <a [routerLink]="['/orders', o.id]" class="btn-ghost !px-2 !py-1 text-xs">جزئیات</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="grid gap-3 p-3 md:hidden">
            @for (o of page()?.data; track o.id) {
              <a [routerLink]="['/orders', o.id]" class="block rounded-lg border border-ink-100 p-3 transition-all hover:border-brand-300 hover:shadow-sm">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="font-mono text-sm font-semibold text-brand-600">{{ o.order_number }}</p>
                    <p class="mt-0.5 text-sm text-ink-600">{{ o.customer?.name ?? 'مشتری حذف‌شده' }}</p>
                  </div>
                  <app-status-badge [status]="o.status" [label]="o.status_label" />
                </div>
                <div class="mt-3 flex items-center justify-between border-t border-ink-100 pt-2">
                  <p class="text-xs text-ink-400">{{ o.created_at | faDate }}</p>
                  <p class="text-sm font-bold text-ink-800">{{ o.total_amount | toman }}</p>
                </div>
              </a>
            }
          </div>

          @if (page(); as pg) {
            <div class="flex flex-col gap-3 border-t border-ink-100 px-4 py-3 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
              <span>{{ pg.total.toLocaleString('fa-IR') }} سفارش · صفحه {{ pg.current_page.toLocaleString('fa-IR') }} از {{ pg.last_page.toLocaleString('fa-IR') }}</span>
              <div class="flex gap-2">
                <button type="button" class="btn-secondary !px-3 !py-1.5" [disabled]="pg.current_page <= 1" (click)="goToPage(pg.current_page - 1)">قبلی</button>
                <button type="button" class="btn-secondary !px-3 !py-1.5" [disabled]="pg.current_page >= pg.last_page" (click)="goToPage(pg.current_page + 1)">بعدی</button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class OrderListComponent {
  private readonly orders = inject(OrdersService);

  readonly loading = signal(true);
  readonly page = signal<Paginated<Order> | null>(null);
  readonly stats = signal<OrderStats | null>(null);
  readonly statusOptions = signal<OrderStatusOption[]>([]);

  search = '';
  status?: OrderStatus;
  private currentPage = 1;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.orders.stats().subscribe((res) => this.stats.set(res.data));
    this.orders.statuses().subscribe((opts) => this.statusOptions.set(opts));
  }

  onFilterChange(): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage = 1;
      this.load();
    }, 300);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const query: ListOrdersQuery = {
      search: this.search || undefined,
      status: this.status,
      page: this.currentPage,
      per_page: 15,
    };
    this.orders.list(query).subscribe({
      next: (res) => {
        this.page.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.page.set({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
          per_page: 15,
          from: null,
          to: null,
        });
        this.loading.set(false);
      },
    });
  }
}
