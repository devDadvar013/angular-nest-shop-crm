import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomersService } from '../../../core/services/customers.service';
import { ProductsService } from '../../../core/services/products.service';
import { OrdersService } from '../../../core/services/orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { Customer, Product } from '../../../core/models';
import { TomanPipe } from '../../../shared/pipes/toman.pipe';

interface DraftLine {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TomanPipe, NgSelectModule],
  template: `
    <div class="mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <a routerLink="/orders" class="btn-ghost !px-2.5" aria-label="بازگشت">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-ink-900">سفارش جدید</h1>
          <p class="mt-1 text-sm text-ink-500">مشتری و اقلام سفارش را انتخاب کنید</p>
        </div>
      </div>

      <div class="card space-y-5 p-6">
        <h2 class="text-sm font-semibold text-ink-800">اطلاعات مشتری</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label class="field-label">مشتری</label>
            <ng-select
              class="rtl-select"
              [items]="customers()"
              bindLabel="name"
              bindValue="id"
              [searchable]="true"
              [clearable]="true"
              placeholder="جستجو و انتخاب مشتری..."
              notFoundText="مشتری‌ای یافت نشد"
              [(ngModel)]="customerId"
            >
              <ng-template ng-option-tmp let-item="item">
                {{ item.name }} <span class="text-ink-400">({{ item.email }})</span>
              </ng-template>
            </ng-select>
          </div>
          <div>
            <label class="field-label">آدرس ارسال (اختیاری)</label>
            <input class="field-input" [(ngModel)]="shippingAddress" placeholder="آدرس تحویل سفارش..." />
          </div>
        </div>

        <div>
          <label class="field-label">یادداشت (اختیاری)</label>
          <textarea class="field-input" rows="2" [(ngModel)]="notes" placeholder="توضیحات سفارش..."></textarea>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="mb-4 text-sm font-semibold text-ink-800">اقلام سفارش</h2>

        <div class="flex flex-col gap-3 border-b border-ink-100 pb-4 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label class="field-label">محصول</label>
            <ng-select
              class="rtl-select"
              [items]="availableProducts()"
              bindLabel="name"
              bindValue="id"
              [searchable]="true"
              [clearable]="true"
              placeholder="جستجو و انتخاب محصول..."
              notFoundText="محصولی یافت نشد"
              [(ngModel)]="selectedProductId"
            >
              <ng-template ng-option-tmp let-item="item">
                {{ item.name }} — {{ item.price | toman }}
                <span class="text-ink-400">(موجودی: {{ item.stock }})</span>
              </ng-template>
            </ng-select>
          </div>
          <div class="w-full sm:w-28">
            <label class="field-label">تعداد</label>
            <input type="number" min="1" class="field-input" [(ngModel)]="selectedQuantity" />
          </div>
          <button type="button" class="btn-secondary" (click)="addLine()">
            <span class="text-base leading-none">+</span>
            <span>افزودن</span>
          </button>
        </div>

        @if (lines().length === 0) {
          <div class="flex flex-col items-center py-10 text-center">
            <span class="text-4xl">🛒</span>
            <p class="mt-2 text-sm text-ink-400">هنوز آیتمی اضافه نشده است.</p>
          </div>
        } @else {
          <!-- Desktop table -->
          <table class="mt-4 hidden w-full text-sm sm:table">
            <thead class="text-right text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th class="py-2 font-semibold">محصول</th>
                <th class="py-2 font-semibold">قیمت واحد</th>
                <th class="py-2 font-semibold">تعداد</th>
                <th class="py-2 font-semibold">جمع</th>
                <th class="py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-ink-100">
              @for (line of lines(); track line.product.id) {
                <tr>
                  <td class="py-2.5 font-medium text-ink-800">{{ line.product.name }}</td>
                  <td class="py-2.5 text-ink-600">{{ line.product.price | toman }}</td>
                  <td class="py-2.5 text-ink-600">{{ line.quantity.toLocaleString('fa-IR') }}</td>
                  <td class="py-2.5 font-semibold text-ink-800">{{ line.product.price * line.quantity | toman }}</td>
                  <td class="py-2.5 text-left">
                    <button type="button" class="text-xs text-rose-600 hover:underline" (click)="removeLine(line)">حذف</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Mobile cards -->
          <div class="mt-3 grid gap-2 sm:hidden">
            @for (line of lines(); track line.product.id) {
              <div class="rounded-lg border border-ink-100 p-3">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-medium text-ink-800">{{ line.product.name }}</p>
                  <button type="button" class="text-xs text-rose-600 hover:underline" (click)="removeLine(line)">حذف</button>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-ink-500">{{ line.quantity.toLocaleString('fa-IR') }} × {{ line.product.price | toman }}</span>
                  <span class="font-semibold text-ink-800">{{ line.product.price * line.quantity | toman }}</span>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
            <span class="text-sm text-ink-500">{{ lines().length.toLocaleString('fa-IR') }} آیتم</span>
            <div class="text-left">
              <p class="text-xs text-ink-500">جمع کل</p>
              <p class="text-xl font-bold text-brand-700">{{ total() | toman }}</p>
            </div>
          </div>
        }
      </div>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <a routerLink="/orders" class="btn-secondary">انصراف</a>
        <button type="button" class="btn-primary" [disabled]="!canSubmit() || saving()" (click)="submit()">
          @if (saving()) {
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            <span>در حال ثبت...</span>
          } @else {
            <span>ثبت سفارش</span>
          }
        </button>
      </div>
    </div>
  `,
})
export class OrderFormComponent {
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);
  private readonly ordersService = inject(OrdersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly lines = signal<DraftLine[]>([]);
  readonly saving = signal(false);

  customerId: number | null = null;
  shippingAddress = '';
  notes = '';
  selectedProductId: number | null = null;
  selectedQuantity = 1;

  readonly availableProducts = computed(() =>
    this.products().filter((p) => p.is_active && p.stock > 0),
  );

  readonly total = computed(() =>
    this.lines().reduce((sum, l) => sum + l.product.price * l.quantity, 0),
  );

  readonly canSubmit = computed(() => this.customerId !== null && this.lines().length > 0);

  constructor() {
    this.customersService.list({ per_page: 100 }).subscribe((res) => this.customers.set(res.data));
    this.productsService.list({ per_page: 100, is_active: true }).subscribe((res) => this.products.set(res.data));
  }

  addLine(): void {
    if (!this.selectedProductId || this.selectedQuantity < 1) return;
    const product = this.products().find((p) => p.id === this.selectedProductId);
    if (!product) return;

    const existing = this.lines().find((l) => l.product.id === product.id);
    if (existing) {
      this.lines.update((lines) =>
        lines.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + this.selectedQuantity } : l)),
      );
    } else {
      this.lines.update((lines) => [...lines, { product, quantity: this.selectedQuantity }]);
    }
    this.selectedProductId = null;
    this.selectedQuantity = 1;
  }

  removeLine(line: DraftLine): void {
    this.lines.update((lines) => lines.filter((l) => l.product.id !== line.product.id));
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.saving.set(true);
    this.ordersService
      .create({
        customer_id: this.customerId!,
        notes: this.notes || undefined,
        shipping_address: this.shippingAddress || undefined,
        items: this.lines().map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      })
      .subscribe({
        next: (res) => {
          this.toast.success('سفارش با موفقیت ثبت شد.');
          this.router.navigate(['/orders', res.data.id]);
        },
        error: () => this.saving.set(false),
      });
  }
}
