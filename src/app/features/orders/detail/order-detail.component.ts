import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrdersService } from '../../../core/services/orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus, OrderStatusOption } from '../../../core/models';
import { TomanPipe } from '../../../shared/pipes/toman.pipe';
import { FaDatePipe } from '../../../shared/pipes/fa-date.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TomanPipe, FaDatePipe, StatusBadgeComponent, ConfirmDialogComponent],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div class="flex items-center gap-3">
        @if (order(); as o) {
          <div>
            <h1 class="text-2xl font-bold text-ink-900">سفارش <span class="font-mono text-brand-600">{{ o.order_number }}</span></h1>
            <p class="mt-1 text-sm text-ink-500">ثبت‌شده در {{ o.created_at | faDate }}</p>
          </div>
        }
        <a routerLink="/orders" class="btn-ghost !px-2.5" aria-label="بازگشت">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>

      @if (order(); as o) {
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="card p-5">
            <h2 class="mb-3 text-sm font-semibold text-ink-800">مشتری</h2>
            @if (o.customer; as c) {
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-base font-bold text-brand-700">
                  {{ c.name.charAt(0) }}
                </div>
                <div>
                  <p class="font-medium text-ink-800">{{ c.name }}</p>
                  <p class="text-sm text-ink-500" dir="ltr">{{ c.email }}</p>
                  @if (c.phone) { <p class="text-sm text-ink-500" dir="ltr">{{ c.phone }}</p> }
                </div>
              </div>
            } @else {
              <p class="text-sm text-ink-400">مشتری حذف‌شده</p>
            }
            @if (o.shipping_address) {
              <div class="mt-4 border-t border-ink-100 pt-3">
                <p class="text-xs font-medium text-ink-400 mb-1">آدرس ارسال</p>
                <p class="text-sm text-ink-700 leading-6">{{ o.shipping_address }}</p>
              </div>
            }
          </div>

          <div class="card p-5">
            <h2 class="mb-3 text-sm font-semibold text-ink-800">وضعیت سفارش</h2>
            <div class="mb-4"><app-status-badge [status]="o.status" [label]="o.status_label" /></div>
            <label class="field-label">تغییر وضعیت</label>
            <select class="field-input" [(ngModel)]="statusSelection" (ngModelChange)="updateStatus()">
              @for (opt of statusOptions(); track opt.value) {
                <option [ngValue]="opt.value">{{ opt.label }}</option>
              }
            </select>
            @if (o.notes) {
              <div class="mt-4 border-t border-ink-100 pt-3">
                <p class="text-xs font-medium text-ink-400 mb-1">یادداشت</p>
                <p class="text-sm text-ink-700 leading-6">{{ o.notes }}</p>
              </div>
            }
          </div>
        </div>

        <div class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-ink-800">اقلام سفارش</h2>
          <!-- Desktop table -->
          <table class="hidden w-full text-sm sm:table">
            <thead class="text-right text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th class="py-2 font-semibold">محصول</th>
                <th class="py-2 font-semibold">قیمت واحد</th>
                <th class="py-2 font-semibold">تعداد</th>
                <th class="py-2 font-semibold">جمع</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              @for (item of o.items; track item.id) {
                <tr>
                  <td class="py-2.5 font-medium text-ink-800">{{ item.product?.name ?? 'محصول حذف‌شده' }}</td>
                  <td class="py-2.5 text-ink-600">{{ item.unit_price | toman }}</td>
                  <td class="py-2.5 text-ink-600">{{ item.quantity.toLocaleString('fa-IR') }}</td>
                  <td class="py-2.5 font-semibold text-ink-800">{{ item.line_total | toman }}</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Mobile cards -->
          <div class="grid gap-2 sm:hidden">
            @for (item of o.items; track item.id) {
              <div class="rounded-lg border border-ink-100 p-3">
                <p class="font-medium text-ink-800">{{ item.product?.name ?? 'محصول حذف‌شده' }}</p>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-ink-500">{{ item.quantity.toLocaleString('fa-IR') }} × {{ item.unit_price | toman }}</span>
                  <span class="font-semibold text-ink-800">{{ item.line_total | toman }}</span>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
            <span class="text-sm text-ink-500">{{ o.items?.length?.toLocaleString('fa-IR') ?? 0 }} آیتم</span>
            <div class="text-left">
              <p class="text-xs text-ink-500">جمع کل</p>
              <p class="text-xl font-bold text-brand-700">{{ o.total_amount | toman }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" class="btn-danger" (click)="confirmOpen.set(true)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
            </svg>
            <span>حذف سفارش</span>
          </button>
        </div>
      } @else {
        <div class="card h-64 animate-pulse bg-gradient-to-br from-ink-100 to-ink-50"></div>
      }
    </div>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="حذف سفارش"
      message="با حذف این سفارش، موجودی محصولات (در صورت لزوم) بازگردانده می‌شود. این عملیات قابل بازگشت نیست."
      (confirmed)="remove()"
      (cancelled)="confirmOpen.set(false)"
    />
  `,
})
export class OrderDetailComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly order = signal<Order | null>(null);
  readonly statusOptions = signal<OrderStatusOption[]>([]);
  readonly confirmOpen = signal(false);
  statusSelection: OrderStatus = 'pending';

  private orderId!: number;

  constructor() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.ordersService.statuses().subscribe((opts) => this.statusOptions.set(opts));
    this.load();
  }

  updateStatus(): void {
    const current = this.order();
    if (!current || this.statusSelection === current.status) return;
    this.ordersService.updateStatus(this.orderId, { status: this.statusSelection }).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.toast.success('وضعیت سفارش به‌روزرسانی شد.');
      },
      error: () => (this.statusSelection = current.status),
    });
  }

  remove(): void {
    this.ordersService.remove(this.orderId).subscribe({
      next: () => {
        this.toast.success('سفارش با موفقیت حذف شد.');
        this.router.navigateByUrl('/orders');
      },
      error: () => this.confirmOpen.set(false),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.ordersService.findOne(this.orderId).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.statusSelection = res.data.status;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('بارگذاری سفارش با خطا مواجه شد.');
      },
    });
  }
}
