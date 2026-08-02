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
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-ink-900">محصولات</h1>
          <p class="mt-1 text-sm text-ink-500">مدیریت کاتالوگ و موجودی محصولات</p>
        </div>
        <a routerLink="/products/new" class="btn-primary">
          <span class="text-lg leading-none">+</span>
          <span>محصول جدید</span>
        </a>
      </div>

      @if (stats(); as st) {
        <div class="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div class="stat-card text-brand-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">تعداد کل</span>
              <span class="text-lg">📦</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-ink-900">{{ st.total.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="stat-card text-emerald-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">فعال</span>
              <span class="text-lg">✅</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-emerald-600">{{ st.active.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="stat-card text-amber-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">موجودی کم</span>
              <span class="text-lg">⚠️</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-amber-600">{{ st.low_stock.toLocaleString('fa-IR') }}</p>
          </div>
          <div class="stat-card text-rose-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium text-ink-500">ناموجود</span>
              <span class="text-lg">❌</span>
            </div>
            <p class="mt-2 text-2xl font-bold text-rose-600">{{ st.out_of_stock.toLocaleString('fa-IR') }}</p>
          </div>
        </div>
      }

      <div class="card p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label class="field-label">جستجو</label>
            <input class="field-input" placeholder="نام، SKU یا توضیحات..." [(ngModel)]="search" (ngModelChange)="onFilterChange()" />
          </div>
          <div class="sm:w-56">
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
          <div class="p-8 text-center text-sm text-ink-400">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"></div>
            <p class="mt-3">در حال بارگذاری...</p>
          </div>
        } @else if (page()?.data?.length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <span class="text-5xl">📭</span>
            <p class="mt-3 text-sm text-ink-500">محصولی یافت نشد.</p>
          </div>
        } @else {
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-ink-100 bg-ink-50/60 text-right text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">محصول</th>
                  <th class="px-4 py-3 font-semibold">SKU</th>
                  <th class="px-4 py-3 font-semibold">قیمت</th>
                  <th class="px-4 py-3 font-semibold">موجودی</th>
                  <th class="px-4 py-3 font-semibold">وضعیت</th>
                  <th class="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (p of page()?.data; track p.id) {
                  <tr class="hover:bg-ink-50/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        @if (p.image_url) {
                          <img [src]="p.image_url" [alt]="p.name" class="h-10 w-10 rounded-lg object-cover ring-1 ring-ink-100" />
                        } @else {
                          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ink-100 to-ink-200 text-ink-400">📦</div>
                        }
                        <span class="font-medium text-ink-800">{{ p.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-ink-500 font-mono text-xs">{{ p.sku }}</td>
                    <td class="px-4 py-3 font-medium text-ink-800">{{ p.price | toman }}</td>
                    <td class="px-4 py-3">
                      <span [class]="p.is_low_stock ? 'text-amber-600 font-semibold' : p.stock === 0 ? 'text-rose-600 font-semibold' : 'text-ink-700'">
                        {{ p.stock.toLocaleString('fa-IR', { useGrouping: false }) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="badge" [class]="p.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-ink-100 text-ink-500 ring-1 ring-inset ring-ink-200'">
                        {{ p.is_active ? 'فعال' : 'غیرفعال' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/products', p.id, 'edit']" class="btn-ghost !px-2 !py-1 text-xs">ویرایش</a>
                        <button type="button" class="btn-ghost !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50" (click)="askDelete(p)">حذف</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="grid gap-3 p-3 md:hidden">
            @for (p of page()?.data; track p.id) {
              <div class="rounded-lg border border-ink-100 p-3 transition-all hover:border-ink-200 hover:shadow-sm">
                <div class="flex items-start gap-3">
                  @if (p.image_url) {
                    <img [src]="p.image_url" [alt]="p.name" class="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-ink-100" />
                  } @else {
                    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-ink-100 to-ink-200 text-xl">📦</div>
                  }
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <p class="font-medium text-ink-800 truncate">{{ p.name }}</p>
                      <span class="badge shrink-0" [class]="p.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-ink-100 text-ink-500 ring-1 ring-inset ring-ink-200'">
                        {{ p.is_active ? 'فعال' : 'غیرفعال' }}
                      </span>
                    </div>
                    <p class="mt-0.5 text-xs text-ink-400 font-mono">{{ p.sku }}</p>
                    <div class="mt-2 flex items-center justify-between">
                      <div>
                        <p class="text-sm font-semibold text-ink-800">{{ p.price | toman }}</p>
                        <p class="text-xs" [class]="p.is_low_stock ? 'text-amber-600' : p.stock === 0 ? 'text-rose-600' : 'text-ink-500'">
                          موجودی: {{ p.stock.toLocaleString('fa-IR', { useGrouping: false }) }}
                        </p>
                      </div>
                      <div class="flex gap-1">
                        <a [routerLink]="['/products', p.id, 'edit']" class="btn-ghost !px-2 !py-1 text-xs">ویرایش</a>
                        <button type="button" class="btn-ghost !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50" (click)="askDelete(p)">حذف</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (page(); as pg) {
            <div class="flex flex-col gap-3 border-t border-ink-100 px-4 py-3 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
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
