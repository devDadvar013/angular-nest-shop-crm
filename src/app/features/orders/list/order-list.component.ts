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
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-ink-900">سفارش‌ها</h1>
          <p class="text-sm text-ink-500">مدیریت و پیگیری سفارش‌های مشتریان</p>
        </div>
        <a routerLink="/orders/new" class="btn-primary">+ سفارش جدید</a>
      </div>

      @if (stats(); as st) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="card p-4">
            <p class="text-xs text-ink-500">تعداد کل سفارش‌ها</p>
            <p class="mt-1 text-xl font-bold text-ink-900">{{ st.total.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">در انتظار</p>
            <p class="mt-1 text-xl font-bold text-amber-600">{{ st.pending.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">درآمد کل</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ st.revenue | toman }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">سفارش‌های امروز</p>
            <p class="mt-1 text-xl font-bold text-brand-600">{{ st.today.toLocaleString('fa-IR') }}</p>
          </div>
        </div>
      }

      <div class="card p-4">
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-[180px] flex-1">
            <label class="field-label">جستجو (شماره سفارش)</label>
            <input class="field-input" placeholder="ORD-20260101-0001" [(ngModel)]="search" (ngModelChange)="onFilterChange()" />
          </div>
          <div>
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
          <div class="p-8 text-center text-sm text-ink-400">در حال بارگذاری...</div>
        } @else if (page()?.data?.length === 0) {
          <div class="p-10 text-center text-sm text-ink-500">سفارشی یافت نشد.</div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-ink-100 bg-ink-50/60 text-right text-xs text-ink-500">
                <tr>
                  <th class="px-4 py-3 font-medium">شماره سفارش</th>
                  <th class="px-4 py-3 font-medium">مشتری</th>
                  <th class="px-4 py-3 font-medium">مبلغ</th>
                  <th class="px-4 py-3 font-medium">وضعیت</th>
                  <th class="px-4 py-3 font-medium">تاریخ</th>
                  <th class="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (o of page()?.data; track o.id) {
                  <tr class="hover:bg-ink-50/50">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/orders', o.id]" class="font-medium text-ink-800 hover:text-brand-600">{{ o.order_number }}</a>
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

          @if (page(); as pg) {
            <div class="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
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
        // Keep the list empty instead of hanging on "در حال بارگذاری..." forever,
        // and don't let a stale/invalid response reach the @for loop.
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
