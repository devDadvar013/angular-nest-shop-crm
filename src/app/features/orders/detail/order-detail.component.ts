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
    <div class="mx-auto max-w-3xl space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/orders" class="btn-ghost !px-2">→</a>
        @if (order(); as o) {
          <div>
            <h1 class="text-xl font-bold text-ink-900">سفارش {{ o.order_number }}</h1>
            <p class="text-sm text-ink-500">ثبت‌شده در {{ o.created_at | faDate }}</p>
          </div>
        }
      </div>

      @if (order(); as o) {
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="card p-5">
            <h2 class="mb-3 text-sm font-semibold text-ink-800">مشتری</h2>
            @if (o.customer; as c) {
              <p class="font-medium text-ink-800">{{ c.name }}</p>
              <p class="text-sm text-ink-500">{{ c.email }}</p>
              @if (c.phone) { <p class="text-sm text-ink-500">{{ c.phone }}</p> }
            } @else {
              <p class="text-sm text-ink-400">مشتری حذف‌شده</p>
            }
            @if (o.shipping_address) {
              <p class="mt-3 text-xs text-ink-400">آدرس ارسال</p>
              <p class="text-sm text-ink-700">{{ o.shipping_address }}</p>
            }
          </div>

          <div class="card p-5">
            <h2 class="mb-3 text-sm font-semibold text-ink-800">وضعیت سفارش</h2>
            <div class="mb-3"><app-status-badge [status]="o.status" [label]="o.status_label" /></div>
            <label class="field-label">تغییر وضعیت</label>
            <select class="field-input" [(ngModel)]="statusSelection" (ngModelChange)="updateStatus()">
              @for (opt of statusOptions(); track opt.value) {
                <option [ngValue]="opt.value">{{ opt.label }}</option>
              }
            </select>
            @if (o.notes) {
              <p class="mt-3 text-xs text-ink-400">یادداشت</p>
              <p class="text-sm text-ink-700">{{ o.notes }}</p>
            }
          </div>
        </div>

        <div class="card p-5">
          <h2 class="mb-4 text-sm font-semibold text-ink-800">اقلام سفارش</h2>
          <table class="w-full text-sm">
            <thead class="text-right text-xs text-ink-500">
              <tr>
                <th class="py-2 font-medium">محصول</th>
                <th class="py-2 font-medium">قیمت واحد</th>
                <th class="py-2 font-medium">تعداد</th>
                <th class="py-2 font-medium">جمع</th>
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
          <div class="mt-4 flex justify-end border-t border-ink-100 pt-4">
            <div class="text-left">
              <p class="text-xs text-ink-500">جمع کل</p>
              <p class="text-lg font-bold text-ink-900">{{ o.total_amount | toman }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" class="btn-danger" (click)="confirmOpen.set(true)">حذف سفارش</button>
        </div>
      } @else {
        <div class="card h-64 animate-pulse bg-ink-100"></div>
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
