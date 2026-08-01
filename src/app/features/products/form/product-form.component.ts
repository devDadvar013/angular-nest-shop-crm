import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/products" class="btn-ghost !px-2">→</a>
        <div>
          <h1 class="text-xl font-bold text-ink-900">{{ isEdit() ? 'ویرایش محصول' : 'محصول جدید' }}</h1>
          <p class="text-sm text-ink-500">اطلاعات محصول را وارد کنید</p>
        </div>
      </div>

      @if (loading()) {
        <div class="card h-64 animate-pulse bg-ink-100"></div>
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
              <input id="sku" class="field-input" formControlName="sku" placeholder="LP-ASUS-VB15" />
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
              <input id="price" type="number" min="0" step="1000" class="field-input" formControlName="price" />
              @if (form.controls.price.touched && form.controls.price.invalid) {
                <p class="mt-1 text-xs text-rose-600">قیمت باید عددی مثبت باشد.</p>
              }
            </div>
            <div>
              <label class="field-label" for="stock">موجودی</label>
              <input id="stock" type="number" min="0" step="1" class="field-input" formControlName="stock" />
              @if (form.controls.stock.touched && form.controls.stock.invalid) {
                <p class="mt-1 text-xs text-rose-600">موجودی باید عددی صحیح و غیرمنفی باشد.</p>
              }
            </div>
          </div>

          <div>
            <label class="field-label" for="image_url">آدرس تصویر (اختیاری)</label>
            <input id="image_url" class="field-input" formControlName="image_url" placeholder="https://..." />
            @if (form.controls.image_url.touched && form.controls.image_url.invalid) {
              <p class="mt-1 text-xs text-rose-600">آدرس تصویر معتبر نیست.</p>
            }
          </div>

          <label class="flex items-center gap-2">
            <input type="checkbox" formControlName="is_active" class="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
            <span class="text-sm text-ink-700">محصول فعال است</span>
          </label>

          <div class="flex justify-end gap-2 pt-2">
            <a routerLink="/products" class="btn-secondary">انصراف</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'در حال ذخیره...' : isEdit() ? 'ذخیره تغییرات' : 'ایجاد محصول' }}
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
