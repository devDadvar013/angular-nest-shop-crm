import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomersService } from '../../../core/services/customers.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-xl space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/customers" class="btn-ghost !px-2">→</a>
        <div>
          <h1 class="text-xl font-bold text-ink-900">{{ isEdit() ? 'ویرایش مشتری' : 'مشتری جدید' }}</h1>
          <p class="text-sm text-ink-500">اطلاعات مشتری را وارد کنید</p>
        </div>
      </div>

      @if (loading()) {
        <div class="card h-56 animate-pulse bg-ink-100"></div>
      } @else {
        <form class="card space-y-5 p-6" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="field-label" for="name">نام کامل</label>
            <input id="name" class="field-input" formControlName="name" placeholder="مثلاً علی رضایی" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <p class="mt-1 text-xs text-rose-600">نام الزامی است.</p>
            }
          </div>

          <div>
            <label class="field-label" for="email">ایمیل</label>
            <input id="email" type="email" class="field-input" formControlName="email" placeholder="example@mail.com" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="mt-1 text-xs text-rose-600">ایمیل معتبر وارد کنید.</p>
            }
          </div>

          <div>
            <label class="field-label" for="phone">شماره تماس (اختیاری)</label>
            <input id="phone" class="field-input" formControlName="phone" placeholder="0912xxxxxxx" />
          </div>

          <div>
            <label class="field-label" for="address">آدرس (اختیاری)</label>
            <textarea id="address" class="field-input" rows="3" formControlName="address" placeholder="آدرس کامل..."></textarea>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <a routerLink="/customers" class="btn-secondary">انصراف</a>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'در حال ذخیره...' : isEdit() ? 'ذخیره تغییرات' : 'ایجاد مشتری' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class CustomerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  private customerId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
  });

  isEdit(): boolean {
    return this.customerId !== null;
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.customerId = Number(idParam);
      this.loading.set(true);
      this.customersService.findOne(this.customerId).subscribe((res) => {
        const c = res.data;
        this.form.patchValue({
          name: c.name,
          email: c.email,
          phone: c.phone ?? '',
          address: c.address ?? '',
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
      email: raw.email,
      phone: raw.phone || undefined,
      address: raw.address || undefined,
    };

    const request = this.isEdit()
      ? this.customersService.update(this.customerId!, payload)
      : this.customersService.create(payload);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'مشتری به‌روزرسانی شد.' : 'مشتری ایجاد شد.');
        this.router.navigateByUrl('/customers');
      },
      error: () => this.saving.set(false),
    });
  }
}
