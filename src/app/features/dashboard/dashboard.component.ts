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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, TomanPipe, FaDatePipe, StatusBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-ink-900">داشبورد</h1>
          <p class="text-sm text-ink-500">نمای کلی فروش و وضعیت فروشگاه</p>
        </div>
        <div class="flex gap-1 rounded-lg border border-ink-200 bg-white p-1">
          @for (r of ranges; track r) {
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              [class]="range() === r ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-ink-50'"
              (click)="setRange(r)"
            >
              {{ r }} روز
            </button>
          }
        </div>
      </div>

      @if (summary(); as s) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (card of statCards(s); track card.label) {
            <div class="card p-5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-ink-500">{{ card.label }}</span>
                <span class="text-lg">{{ card.icon }}</span>
              </div>
              <p class="mt-2 text-2xl font-bold text-ink-900">{{ card.value }}</p>
            </div>
          }
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <div class="card p-5 lg:col-span-2">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-ink-800">روند فروش</h2>
              <span class="text-xs text-ink-400">{{ s.range_days }} روز اخیر</span>
            </div>
            @if (chartPoints().length > 1) {
              <svg viewBox="0 0 600 180" class="w-full" preserveAspectRatio="none">
                <polyline
                  [attr.points]="chartPolyline()"
                  fill="none"
                  stroke="#2e6b61"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polygon [attr.points]="chartArea()" fill="url(#grad)" opacity="0.25" />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2e6b61" />
                    <stop offset="100%" stop-color="#2e6b61" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="mt-1 flex justify-between text-[11px] text-ink-400">
                <span>{{ s.daily_revenue[0]?.date | faDate: false }}</span>
                <span>{{ s.daily_revenue[s.daily_revenue.length - 1]?.date | faDate: false }}</span>
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
                  <span class="font-semibold text-ink-800">{{ entry.value }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="card p-5">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-ink-800">سفارش‌های اخیر</h2>
              <a routerLink="/orders" class="text-xs font-medium text-brand-600 hover:underline">مشاهده همه</a>
            </div>
            @if (recentOrders().length === 0) {
              <p class="py-6 text-center text-sm text-ink-400">سفارشی ثبت نشده است.</p>
            } @else {
              <ul class="divide-y divide-ink-100">
                @for (order of recentOrders(); track order.id) {
                  <li class="flex items-center justify-between py-3">
                    <div>
                      <a [routerLink]="['/orders', order.id]" class="text-sm font-medium text-ink-800 hover:text-brand-600">
                        {{ order.order_number }}
                      </a>
                      <p class="text-xs text-ink-400">{{ order.customer?.name ?? 'مشتری حذف‌شده' }}</p>
                    </div>
                    <div class="text-left">
                      <p class="text-sm font-semibold text-ink-800">{{ order.total_amount | toman }}</p>
                      <app-status-badge [status]="order.status" [label]="order.status_label" />
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <div class="card p-5">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-ink-800">پرفروش‌ترین محصولات</h2>
              <a routerLink="/products" class="text-xs font-medium text-brand-600 hover:underline">مشاهده همه</a>
            </div>
            @if (topProducts().length === 0) {
              <p class="py-6 text-center text-sm text-ink-400">هنوز فروشی ثبت نشده است.</p>
            } @else {
              <ul class="divide-y divide-ink-100">
                @for (p of topProducts(); track p.id) {
                  <li class="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p class="font-medium text-ink-800">{{ p.name }}</p>
                      <p class="text-xs text-ink-400">{{ p.sku }} · {{ p.sold }} فروش</p>
                    </div>
                    <p class="font-semibold text-ink-800">{{ p.revenue | toman }}</p>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="card h-24 animate-pulse bg-ink-100"></div>
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
      .map((p, i) => `${(i * stepX).toFixed(1)},${(170 - (p.total / max) * 160).toFixed(1)}`)
      .join(' ');
  });

  readonly chartArea = computed(() => {
    const line = this.chartPolyline();
    if (!line) return '';
    return `0,170 ${line} 600,170`;
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
      { label: 'درآمد کل', value: s.total_revenue.toLocaleString('fa-IR') + ' تومان', icon: '💰', accent: 'brand' },
      { label: 'تعداد سفارش‌ها', value: s.orders_count.toLocaleString('fa-IR'), icon: '🧾', accent: 'blue' },
      { label: 'سفارش‌های در انتظار', value: s.pending_orders.toLocaleString('fa-IR'), icon: '⏳', accent: 'amber' },
      { label: 'میانگین ارزش سفارش', value: s.average_order_value.toLocaleString('fa-IR') + ' تومان', icon: '📈', accent: 'emerald' },
      { label: 'تعداد مشتریان', value: s.customers_count.toLocaleString('fa-IR'), icon: '👥', accent: 'indigo' },
      { label: 'تعداد محصولات', value: s.products_count.toLocaleString('fa-IR'), icon: '📦', accent: 'slate' },
      { label: 'موجودی کم', value: s.low_stock_count.toLocaleString('fa-IR'), icon: '⚠️', accent: 'rose' },
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
      value,
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
