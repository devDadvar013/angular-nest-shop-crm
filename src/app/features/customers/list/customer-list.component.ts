import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CustomersService } from '../../../core/services/customers.service';
import { ToastService } from '../../../core/services/toast.service';
import { Customer, ListCustomersQuery, Paginated } from '../../../core/models';
import { TomanPipe } from '../../../shared/pipes/toman.pipe';
import { FaDatePipe } from '../../../shared/pipes/fa-date.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TomanPipe, FaDatePipe, ConfirmDialogComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-ink-900">مشتریان</h1>
          <p class="mt-1 text-sm text-ink-500">مدیریت اطلاعات مشتریان فروشگاه</p>
        </div>
        <a routerLink="/customers/new" class="btn-primary">
          <span class="text-lg leading-none">+</span>
          <span>مشتری جدید</span>
        </a>
      </div>

      <div class="card p-4">
        <label class="field-label">جستجو</label>
        <input class="field-input max-w-md" placeholder="نام، ایمیل یا شماره تماس..." [(ngModel)]="search" (ngModelChange)="onSearchChange()" />
      </div>

      <div class="card overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center text-sm text-ink-400">
            <div class="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"></div>
            <p class="mt-3">در حال بارگذاری...</p>
          </div>
        } @else if (page()?.data?.length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <span class="text-5xl">👥</span>
            <p class="mt-3 text-sm text-ink-500">مشتری‌ای یافت نشد.</p>
          </div>
        } @else {
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b border-ink-100 bg-ink-50/60 text-right text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">نام</th>
                  <th class="px-4 py-3 font-semibold">تماس</th>
                  <th class="px-4 py-3 font-semibold">سفارش‌ها</th>
                  <th class="px-4 py-3 font-semibold">مجموع خرید</th>
                  <th class="px-4 py-3 font-semibold">تاریخ عضویت</th>
                  <th class="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-ink-100">
                @for (c of page()?.data; track c.id) {
                  <tr class="hover:bg-ink-50/50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700">
                          {{ c.name.charAt(0) }}
                        </div>
                        <span class="font-medium text-ink-800">{{ c.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-ink-500">
                      <div class="text-sm">{{ c.email }}</div>
                      @if (c.phone) { <div class="text-xs text-ink-400" dir="ltr">{{ c.phone }}</div> }
                    </td>
                    <td class="px-4 py-3 text-ink-700">{{ (c.orders_count ?? 0).toLocaleString('fa-IR') }}</td>
                    <td class="px-4 py-3 font-medium text-ink-800">{{ c.total_spent ?? 0 | toman }}</td>
                    <td class="px-4 py-3 text-ink-500">{{ c.created_at | faDate: false }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/customers', c.id, 'edit']" class="btn-ghost !px-2 !py-1 text-xs">ویرایش</a>
                        <button type="button" class="btn-ghost !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50" (click)="askDelete(c)">حذف</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Mobile cards -->
          <div class="grid gap-3 p-3 md:hidden">
            @for (c of page()?.data; track c.id) {
              <div class="rounded-lg border border-ink-100 p-3 transition-all hover:border-ink-200 hover:shadow-sm">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-base font-bold text-brand-700">
                    {{ c.name.charAt(0) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-ink-800 truncate">{{ c.name }}</p>
                    <p class="text-xs text-ink-500 truncate">{{ c.email }}</p>
                    @if (c.phone) {
                      <p class="text-xs text-ink-400" dir="ltr">{{ c.phone }}</p>
                    }
                    <div class="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
                      <div>
                        <p class="text-[11px] text-ink-400">{{ (c.orders_count ?? 0).toLocaleString('fa-IR') }} سفارش</p>
                        <p class="text-sm font-semibold text-ink-800">{{ c.total_spent ?? 0 | toman }}</p>
                      </div>
                      <div class="flex gap-1">
                        <a [routerLink]="['/customers', c.id, 'edit']" class="btn-ghost !px-2 !py-1 text-xs">ویرایش</a>
                        <button type="button" class="btn-ghost !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50" (click)="askDelete(c)">حذف</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (page(); as pg) {
            <div class="flex flex-col gap-3 border-t border-ink-100 px-4 py-3 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
              <span>{{ pg.total.toLocaleString('fa-IR') }} مشتری · صفحه {{ pg.current_page.toLocaleString('fa-IR') }} از {{ pg.last_page.toLocaleString('fa-IR') }}</span>
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
      title="حذف مشتری"
      [message]="'آیا از حذف «' + (toDelete()?.name ?? '') + '» مطمئن هستید؟ در صورت داشتن سفارش، حذف امکان‌پذیر نیست.'"
      (confirmed)="confirmDelete()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class CustomerListComponent {
  private readonly customers = inject(CustomersService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly page = signal<Paginated<Customer> | null>(null);
  readonly toDelete = signal<Customer | null>(null);

  search = '';
  private currentPage = 1;
  private searchDebounce?: ReturnType<typeof setTimeout>;

  constructor() {
    this.load();
  }

  onSearchChange(): void {
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

  askDelete(c: Customer): void {
    this.toDelete.set(c);
  }

  confirmDelete(): void {
    const c = this.toDelete();
    if (!c) return;
    this.customers.remove(c.id).subscribe({
      next: () => {
        this.toast.success('مشتری با موفقیت حذف شد.');
        this.toDelete.set(null);
        this.load();
      },
      error: () => this.toDelete.set(null),
    });
  }

  private load(): void {
    this.loading.set(true);
    const query: ListCustomersQuery = { search: this.search || undefined, page: this.currentPage, per_page: 15 };
    this.customers.list(query).subscribe({
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
}
