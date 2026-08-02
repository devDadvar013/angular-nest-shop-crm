import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardSummary, Order, TopProduct } from '../../core/models';
import { TomanPipe } from '../../shared/pipes/toman.pipe';
import { FaDatePipe } from '../../shared/pipes/fa-date.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  accent: string;
  sub?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TomanPipe, FaDatePipe, StatusBadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-ink-900">داشبورد</h1>
          <p class="mt-1 text-sm text-ink-500">نمای کلی فروش و وضعیت فروشگاه</p>
        </div>
        <div class="flex gap-1 rounded-lg border border-ink-200 bg-white p-1 shadow-sm">
          @for (r of ranges; track r) {
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              [class]="range() === r ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-50'"
              (click)="setRange(r)"
            >
              {{ r }} روز
            </button>
          }
        </div>
      </div>

      @if (summary(); as s) {
        <div class="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          @for (card of statCards(s); track card.label) {
            <div class="stat-card" [style.color]="card.accent">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-ink-500">{{ card.label }}</span>
                <span class="flex h-9 w-9 items-center justify-center rounded-lg text-lg" [style.background-color]="card.accent + '14'">
                  {{ card.icon }}
                </span>
              </div>
              <p class="mt-3 text-2xl font-bold text-ink-900">{{ card.value }}</p>
            </div>
          }
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <div class="card p-5 lg:col-span-2">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-ink-800">روند فروش</h2>
                <p class="text-xs text-ink-400">درآمد روزانه</p>
              </div>
              <span class="badge bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200">{{ s.range_days }} روز اخیر</span>
            </div>
            @if (chartPoints().length > 1) {
              <div class="relative">
                <svg viewBox="0 0 600 200" class="w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#2e6b61" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="#2e6b61" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#3d867a" />
                      <stop offset="100%" stop-color="#27564f" />
                    </linearGradient>
                  </defs>
                  <!-- grid lines -->
                  <line x1="0" y1="40" x2="600" y2="40" stroke="#e2e4e4" stroke-dasharray="2,4" stroke-width="1" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#e2e4e4" stroke-dasharray="2,4" stroke-width="1" />
                  <line x1="0" y1="160" x2="600" y2="160" stroke="#e2e4e4" stroke-dasharray="2,4" stroke-width="1" />
                  <polygon [attr.points]="chartArea()" fill="url(#grad)" />
                  <polyline
                    [attr.points]="chartPolyline()"
                    fill="none"
                    stroke="url(#lineGrad)"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  @for (pt of chartDotPoints(); track pt.x) {
                    <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="3" fill="white" stroke="#2e6b61" stroke-width="2" />
                  }
                </svg>
              </div>
              <div class="mt-2 flex justify-between text-[11px] text-ink-400">
                <span>{{ s.daily_revenue[0].date | faDate: false }}</span>
                <span>{{ s.daily_revenue[s.daily_revenue.length - 1].date | faDate: false }}</span>
              </div>
            } @else {
              <p class="py-10 text-center text-sm text-ink-400">داده‌ای برای نمایش نمودار موجود نیست.</p>
            }
          </div>

          <div class="card p-5">
            <h2 class="mb-4 text-sm font-semibold text-ink-800">وضعیت سفارش‌ها</h2>
            <ul class="space-y-3">
              @for (entry of statusBreakdownEntries(s); track entry.key) {
                <li class="flex items-center justify-between text-sm">
                  <app-status-badge [status]="entry.key" [label]="entry.label" />
                  <span class="font-semibold text-ink-800">{{ entry.value.toLocaleString('fa-IR') }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="card p-5">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-ink-800">سفارش‌های اخیر</h2>
              <a routerLink="/orders" class="text-xs font-medium text-brand-600 hover:underline">مشاهده همه ←</a>
            </div>
            @if (recentOrders().length === 0) {
              <div class="flex flex-col items-center py-8 text-center">
                <span class="text-3xl">📋</span>
                <p class="mt-2 text-sm text-ink-400">سفارشی ثبت نشده است.</p>
              </div>
            } @else {
              <ul class="divide-y divide-ink-100">
                @for (order of recentOrders(); track order.id) {
                  <li class="py-3 first:pt-0 last:pb-0">
                    <a [routerLink]="['/orders', order.id]" class="group flex items-center justify-between gap-3 rounded-md p-1 -m-1 transition-colors hover:bg-ink-50/50">
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-ink-800 group-hover:text-brand-600">
                          {{ order.order_number }}
                        </p>
                        <p class="text-xs text-ink-400 truncate">{{ order.customer?.name ?? 'مشتری حذف‌شده' }}</p>
                      </div>
                      <div class="text-left shrink-0">
                        <p class="text-sm font-semibold text-ink-800">{{ order.total_amount | toman }}</p>
                        <div class="mt-1">
                          <app-status-badge [status]="order.status" [label]="order.status_label" />
                        </div>
                      </div>
                    </a>
                  </li>
                }
              </ul>
            }
          </div>

          <div class="card p-5">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-ink-800">پرفروش‌ترین محصولات</h2>
              <a routerLink="/products" class="text-xs font-medium text-brand-600 hover:underline">مشاهده همه ←</a>
            </div>
            @if (topProducts().length === 0) {
              <div class="flex flex-col items-center py-8 text-center">
                <span class="text-3xl">🏆</span>
                <p class="mt-2 text-sm text-ink-400">هنوز فروشی ثبت نشده است.</p>
              </div>
            } @else {
              <ul class="divide-y divide-ink-100">
                @for (p of topProducts(); track p.id) {
                  <li class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div class="flex min-w-0 flex-1 items-center gap-3">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ink-100 to-ink-200 text-base">📦</div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-ink-800">{{ p.name }}</p>
                        <p class="text-xs text-ink-400 truncate">{{ p.sku }} · {{ p.sold.toLocaleString('fa-IR') }} فروش</p>
                      </div>
                    </div>
                    <p class="shrink-0 text-sm font-semibold text-ink-800">{{ p.revenue | toman }}</p>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      } @else {
        <div class="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="card h-24 animate-pulse bg-gradient-to-br from-ink-100 to-ink-50"></div>
          }
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private readonly dashboard = inject(DashboardService);

  readonly ranges = [7, 30, 90] as const;
  readonly range = signal<number>(30);
  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly recentOrders = signal<Order[]>([]);
  readonly topProducts = signal<TopProduct[]>([]);

  readonly chartPoints = computed(() => this.summary()?.daily_revenue ?? []);

  readonly chartPolyline = computed(() => {
    const points = this.chartPoints();
    if (points.length < 2) return '';
    const max = Math.max(...points.map((p) => p.total), 1);
    const stepX = 600 / (points.length - 1);
    return points
      .map((p, i) => `${(i * stepX).toFixed(1)},${(180 - (p.total / max) * 160).toFixed(1)}`)
      .join(' ');
  });

  readonly chartArea = computed(() => {
    const line = this.chartPolyline();
    if (!line) return '';
    return `0,180 ${line} 600,180`;
  });

  readonly chartDotPoints = computed(() => {
    const points = this.chartPoints();
    if (points.length < 2) return [];
    const max = Math.max(...points.map((p) => p.total), 1);
    const stepX = 600 / (points.length - 1);
    return points.map((p, i) => ({
      x: (i * stepX).toFixed(1),
      y: (180 - (p.total / max) * 160).toFixed(1),
    }));
  });

  constructor() {
    this.load();
  }

  setRange(r: number): void {
    this.range.set(r);
    this.load();
  }

  statCards(s: DashboardSummary): StatCard[] {
    return [
      { label: 'درآمد کل', value: s.total_revenue.toLocaleString('fa-IR') + ' تومان', icon: '💰', accent: '#2e6b61' },
      { label: 'تعداد سفارش‌ها', value: s.orders_count.toLocaleString('fa-IR'), icon: '🧾', accent: '#2563eb' },
      { label: 'سفارش‌های در انتظار', value: s.pending_orders.toLocaleString('fa-IR'), icon: '⏳', accent: '#d97706' },
      { label: 'میانگین ارزش سفارش', value: s.average_order_value.toLocaleString('fa-IR') + ' تومان', icon: '📈', accent: '#059669' },
      { label: 'تعداد مشتریان', value: s.customers_count.toLocaleString('fa-IR'), icon: '👥', accent: '#4f46e5' },
      { label: 'تعداد محصولات', value: s.products_count.toLocaleString('fa-IR'), icon: '📦', accent: '#475569' },
      { label: 'موجودی کم', value: s.low_stock_count.toLocaleString('fa-IR'), icon: '⚠️', accent: '#e11d48' },
    ];
  }

  statusBreakdownEntries(s: DashboardSummary) {
    const labels: Record<string, string> = {
      pending: 'در انتظار',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل شده',
      cancelled: 'لغو شده',
    };
    return Object.entries(s.status_breakdown).map(([key, value]) => ({
      key: key as Order['status'],
      label: labels[key] ?? key,
      value: value as number,
    }));
  }

  private load(): void {
    this.loading.set(true);
    this.dashboard.summary(this.range()).subscribe((res) => {
      this.summary.set(res.data);
      this.loading.set(false);
    });
    this.dashboard.recentOrders(5).subscribe((res) => this.recentOrders.set(res.data));
    this.dashboard.topProducts(5).subscribe((res) => this.topProducts.set(res.data));
  }
}
