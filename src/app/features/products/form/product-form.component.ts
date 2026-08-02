import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { ToastService } from '../../../core/services/toast.service';
import { NumberFormatDirective } from '../../../shared/directives/number-format.directive';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NumberFormatDirective],
  template: `
    <div class="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div class="flex items-center gap-3">
        <a routerLink="/products" class="btn-ghost !px-2.5" aria-label="بازگشت">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-ink-900">{{ isEdit() ? 'ویرایش محصول' : 'محصول جدید' }}</h1>
          <p class="mt-1 text-sm text-ink-500">اطلاعات محصول را وارد کنید</p>
        </div>
      </div>

      @if (loading()) {
        <div class="card h-64 animate-pulse bg-gradient-to-br from-ink-100 to-ink-50"></div>
      } @else {
        <form class="card space-y-5 p-6" [formGroup]="form" (ngSubmit)="submit()">
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="field-label" for="name">نام محصول</label>
              <input id="name" class="field-input" formControlName="name" placeholder="مثلاً لپ‌تاپ ایسوس VivoBook 15" />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <p class="mt-1 text-xs text-rose-600">نام محصول الزامی است.</p>
              }
            </div>
            <div>
              <label class="field-label" for="sku">کد محصول (SKU)</label>
              <input id="sku" class="field-input font-mono" formControlName="sku" placeholder="LP-ASUS-VB15" />
              @if (form.controls.sku.touched && form.controls.sku.invalid) {
                <p class="mt-1 text-xs text-rose-600">SKU الزامی است.</p>
              }
            </div>
          </div>

          <div>
            <label class="field-label" for="description">توضیحات</label>
            <textarea id="description" class="field-input" rows="3" formControlName="description" placeholder="توضیح مختصر محصول..."></textarea>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label class="field-label" for="price">قیمت (تومان)</label>
              <input id="price" type="text" inputmode="numeric" class="field-input" formControlName="price" appNumberFormat />
              @if (form.controls.price.touched && form.controls.price.invalid) {
                <p class="mt-1 text-xs text-rose-600">قیمت باید عددی مثبت باشد.</p>
              }
            </div>
            <div>
              <label class="field-label" for="stock">موجودی</label>
              <input id="stock" type="number" inputmode="numeric" class="field-input" formControlName="stock" min="0" step="1" />
              @if (form.controls.stock.touched && form.controls.stock.invalid) {
                <p class="mt-1 text-xs text-rose-600">موجودی باید عددی صحیح و غیرمنفی باشد.</p>
              }
            </div>
          </div>

          <div>
            <label class="field-label" for="image_url">آدرس تصویر (اختیاری)</label>
            <input id="image_url" class="field-input" formControlName="image_url" placeholder="https://..." dir="ltr" />
            @if (form.controls.image_url.touched && form.controls.image_url.invalid) {
              <p class="mt-1 text-xs text-rose-600">آدرس تصویر معتبر نیست.</p>
            }
          </div>

          <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-ink-200 bg-ink-50/50 p-3 transition-colors hover:bg-ink-50">
            <input type="checkbox" formControlName="is_active" class="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
            <div>
              <p class="text-sm font-medium text-ink-800">محصول فعال است</p>
              <p class="text-xs text-ink-500">محصولات غیرفعال در لیست سفارش‌ها نمایش داده نمی‌شوند.</p>
            </div>
          </label>

          <div class="flex flex-col-reverse gap-2 border-t border-ink-100 pt-4 sm:flex-row sm:justify-end">
            <a routerLink="/products" class="btn-secondary">انصراف</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              @if (saving()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                <span>در حال ذخیره...</span>
              } @else {
                <span>{{ isEdit() ? 'ذخیره تغییرات' : 'ایجاد محصول' }}</span>
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ProductFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  private productId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    sku: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image_url: [''],
    is_active: [true],
  });

  isEdit(): boolean {
    return this.productId !== null;
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productId = Number(idParam);
      this.loading.set(true);
      this.productsService.findOne(this.productId).subscribe((res) => {
        const p = res.data;
        this.form.patchValue({
          name: p.name,
          sku: p.sku,
          description: p.description ?? '',
          price: p.price,
          stock: p.stock,
          image_url: p.image_url ?? '',
          is_active: p.is_active,
        });
        this.loading.set(false);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      sku: raw.sku,
      description: raw.description || undefined,
      price: Number(raw.price),
      stock: Number(raw.stock),
      image_url: raw.image_url || undefined,
      is_active: raw.is_active,
    };

    const request = this.isEdit()
      ? this.productsService.update(this.productId!, payload)
      : this.productsService.create(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'محصول به‌روزرسانی شد.' : 'محصول ایجاد شد.');
        this.router.navigateByUrl('/products');
      },
      error: () => this.saving.set(false),
    });
  }
}
