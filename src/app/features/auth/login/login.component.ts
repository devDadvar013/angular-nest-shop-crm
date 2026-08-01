import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex flex-col items-center gap-2">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">ش</div>
          <h1 class="text-xl font-bold text-ink-900">ورود به شاپ سی‌آرام</h1>
          <p class="text-sm text-ink-500">برای مدیریت فروشگاه وارد شوید</p>
        </div>

        <form class="card space-y-4 p-6" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label class="field-label" for="email">ایمیل</label>
            <input
              id="email"
              type="email"
              class="field-input"
              placeholder="admin@shop.io"
              formControlName="email"
              autocomplete="username"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="mt-1 text-xs text-rose-600">یک ایمیل معتبر وارد کنید.</p>
            }
          </div>

          <div>
            <label class="field-label" for="password">رمز عبور</label>
            <input
              id="password"
              type="password"
              class="field-input"
              placeholder="••••••••"
              formControlName="password"
              autocomplete="current-password"
            />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <p class="mt-1 text-xs text-rose-600">رمز عبور الزامی است.</p>
            }
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || loading()">
            @if (loading()) {
              <span>در حال ورود...</span>
            } @else {
              <span>ورود</span>
            }
          </button>

          <p class="text-center text-xs text-ink-400">
            کاربر پیش‌فرض: admin&#64;shop.io / password
          </p>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['admin@shop.io', [Validators.required, Validators.email]],
    password: ['password', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/dashboard';
        this.toast.success('خوش آمدید');
        this.router.navigateByUrl(redirect);
      },
      error: () => this.loading.set(false),
    });
  }
}
