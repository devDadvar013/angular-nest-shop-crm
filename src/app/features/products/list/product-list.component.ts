import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { ToastService } from '../../../core/services/toast.service';
import { ListProductsQuery, Paginated, Product, ProductSort, ProductStats } from '../../../core/models';
import { TomanPipe } from '../../../shared/pipes/toman.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TomanPipe, ConfirmDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-ink-900">محصولات</h1>
          <p class="text-sm text-ink-500">مدیریت کاتالوگ و موجودی محصولات</p>
        </div>
        <a routerLink="/products/new" class="btn-primary">+ محصول جدید</a>
      </div>

      @if (stats(); as st) {
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="card p-4">
            <p class="text-xs text-ink-500">تعداد کل</p>
            <p class="mt-1 text-xl font-bold text-ink-900">{{ st.total.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">فعال</p>
            <p class="mt-1 text-xl font-bold text-emerald-600">{{ st.active.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">موجودی کم</p>
            <p class="mt-1 text-xl font-bold text-amber-600">{{ st.low_stock.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="card p-4">
            <p class="text-xs text-ink-500">ناموجود</p>
            <p class="mt-1 text-xl font-bold text-rose-600">{{ st.out_of_stock.toLocaleString('fa-IR') }}</p>
          </div>
        </div>
      }

      <div class="card p-4">
        <div class="flex flex-wrap items-end gap-3">
          <div class="min-w-[200px] flex-1">
            <label class="field-label">جستجو</label>
            <input class="field-input" placeholder="نام، SKU یا توضیحات..." [(ngModel)]="search" (ngModelChange)="onFilterChange()" />
          </div>
          <div>
            <label class="field-label">وضعیت</label>
            <select class="field-input" [(ngModel)]="isActive" (ngModelChange)="onFilterChange()">
              <option [ngValue]="undefined">همه</option>
              <option [ngValue]="true">فعال</option>
              <option [ngValue]="false">غیرفعال</option>
            </select>
          </div>
          <div>
            <label class="field-label">موجودی</label>
            <select class="field-input" [(ngModel)]="inStock" (ngModelChange)="onFilterChange()">
              <option [ngValue]="undefined">همه</option>
              <option [ngValue]="true">موجود</option>
              <option [ngValue]="false">ناموجود</option>
            </select>
          </div>
          <div>
            <label class="field-label">مرتب‌سازی</label>
            <select class="field-input" [(ngModel)]="sort" (ngModelChange)="onFilterChange()">
              <option value="latest">جدیدترین</option>
              <option value="price_asc">قیمت: کم به زیاد</option>
              <option value="price_desc">قیمت: زیاد به کم</option>
              <option value="name">نام</option>
              <option value="stock">موجودی</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-sm text-ink-400">در حال بارگذاری...</div>
        } @else if (page()?.data?.length === 0) {
          <div class="p-10 text-center">
            <p class="text-sm text-ink-500">محصولی یافت نشد.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-ink-100 bg-ink-50/60 text-right text-xs text-ink-500">
                <tr>
                  <th class="px-4 py-3 font-medium">محصول</th>
                  <th class="px-4 py-3 font-medium">SKU</th>
                  <th class="px-4 py-3 font-medium">قیمت</th>
                  <th class="px-4 py-3 font-medium">موجودی</th>
                  <th class="px-4 py-3 font-medium">وضعیت</th>
                  <th class="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (p of page()?.data; track p.id) {
                  <tr class="hover:bg-ink-50/50">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        @if (p.image_url) {
                          <img [src]="p.image_url" [alt]="p.name" class="h-10 w-10 rounded-lg object-cover" />
                        } @else {
                          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-100 text-ink-400">📦</div>
                        }
                        <span class="font-medium text-ink-800">{{ p.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-ink-500">{{ p.sku }}</td>
                    <td class="px-4 py-3 font-medium text-ink-800">{{ p.price | toman }}</td>
                    <td class="px-4 py-3">
                      <span [class]="p.is_low_stock ? 'text-amber-600 font-semibold' : p.stock === 0 ? 'text-rose-600 font-semibold' : 'text-ink-700'">
                        {{ p.stock.toLocaleString('fa-IR') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="badge" [class]="p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink-100 text-ink-500'">
                        {{ p.is_active ? 'فعال' : 'غیرفعال' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/products', p.id, 'edit']" class="btn-ghost !px-2 !py-1 text-xs">ویرایش</a>
                        <button type="button" class="btn-ghost !px-2 !py-1 text-xs text-rose-600" (click)="askDelete(p)">حذف</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (page(); as pg) {
            <div class="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-xs text-ink-500">
              <span>{{ pg.total.toLocaleString('fa-IR') }} محصول · صفحه {{ pg.current_page.toLocaleString('fa-IR') }} از {{ pg.last_page.toLocaleString('fa-IR') }}</span>
              <div class="flex gap-2">
                <button type="button" class="btn-secondary !px-3 !py-1.5" [disabled]="pg.current_page <= 1" (click)="goToPage(pg.current_page - 1)">قبلی</button>
                <button type="button" class="btn-secondary !px-3 !py-1.5" [disabled]="pg.current_page >= pg.last_page" (click)="goToPage(pg.current_page + 1)">بعدی</button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <app-confirm-dialog
      [open]="!!toDelete()"
      title="حذف محصول"
      [message]="'آیا از حذف «' + (toDelete()?.name ?? '') + '» مطمئن هستید؟'"
      (confirmed)="confirmDelete()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class ProductListComponent {
  private readonly products = inject(ProductsService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly page = signal<Paginated<Product> | null>(null);
  readonly stats = signal<ProductStats | null>(null);
  readonly toDelete = signal<Product | null>(null);

  search = '';
  isActive?: boolean;
  inStock?: boolean;
  sort: ProductSort = 'latest';
  private currentPage = 1;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
    this.loadStats();
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

  askDelete(p: Product): void {
    this.toDelete.set(p);
  }

  confirmDelete(): void {
    const p = this.toDelete();
    if (!p) return;
    this.products.remove(p.id).subscribe(() => {
      this.toast.success('محصول با موفقیت حذف شد.');
      this.toDelete.set(null);
      this.load();
      this.loadStats();
    });
  }

  private load(): void {
    this.loading.set(true);
    const query: ListProductsQuery = {
      search: this.search || undefined,
      is_active: this.isActive,
      in_stock: this.inStock,
      sort: this.sort,
      page: this.currentPage,
      per_page: 15,
    };
    this.products.list(query).subscribe({
      next: (res) => {
        this.page.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.page.set({ data: [], total: 0, current_page: 1, last_page: 1, per_page: 15, from: null, to: null });
        this.loading.set(false);
      },
    });
  }

  private loadStats(): void {
    this.products.stats().subscribe((res) => this.stats.set(res.data));
  }
}
