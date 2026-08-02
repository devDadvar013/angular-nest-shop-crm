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
    <div class="flex min-h-screen bg-ink-50">
      <!-- Branding panel (desktop only) -->
      <div class="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 lg:flex lg:w-1/2 xl:w-[55%]">
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size: 60px 60px;"></div>
        <div class="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
        <div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl"></div>

        <div class="relative z-10 flex flex-1 flex-col justify-between p-12 text-white">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-xl font-bold shadow-lg">ش</div>
            <div>
              <p class="text-lg font-bold">ShopOrders</p>
              <p class="text-xs text-white/70">سیستم مدیریت فروشگاه</p>
            </div>
          </div>

          <div class="max-w-md">
            <h1 class="text-4xl font-bold leading-tight">مدیریت هوشمند<br/>فروشگاه شما</h1>
            <p class="mt-4 text-base leading-8 text-white/80">
              محصولات، مشتریان و سفارش‌های خود را در یک پنل ساده و سریع مدیریت کنید. همه چیز در دسترستان است.
            </p>
            <div class="mt-8 grid grid-cols-3 gap-4">
              <div class="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p class="text-2xl font-bold">📦</p>
                <p class="mt-1 text-xs text-white/80">مدیریت محصولات</p>
              </div>
              <div class="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p class="text-2xl font-bold">🧾</p>
                <p class="mt-1 text-xs text-white/80">پیگیری سفارش‌ها</p>
              </div>
              <div class="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                <p class="text-2xl font-bold">📊</p>
                <p class="mt-1 text-xs text-white/80">گزارش‌های دقیق</p>
              </div>
            </div>
          </div>

          <p class="text-xs text-white/60">© ۱۴۰۵ — تمامی حقوق محفوظ است.</p>
        </div>
      </div>

      <!-- Form panel -->
      <div class="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div class="w-full max-w-sm animate-fade-in">
          <div class="mb-8 flex flex-col items-center gap-3 lg:items-start">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-md lg:hidden">ش</div>
            <div class="text-center lg:text-right">
              <h1 class="text-2xl font-bold text-ink-900">خوش آمدید 👋</h1>
              <p class="mt-1 text-sm text-ink-500">برای ورود به پنل، ایمیل و رمز عبور خود را وارد کنید.</p>
            </div>
          </div>

          <form class="card space-y-4 p-6 shadow-card-hover" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="field-label" for="email">ایمیل</label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  class="field-input !pr-10"
                  placeholder="admin@shop.io"
                  formControlName="email"
                  autocomplete="username"
                />
              </div>
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <p class="mt-1 text-xs text-rose-600">یک ایمیل معتبر وارد کنید.</p>
              }
            </div>

            <div>
              <label class="field-label" for="password">رمز عبور</label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  class="field-input !pr-10"
                  placeholder="••••••••"
                  formControlName="password"
                  autocomplete="current-password"
                />
              </div>
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <p class="mt-1 text-xs text-rose-600">رمز عبور الزامی است.</p>
              }
            </div>

            <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                <span>در حال ورود...</span>
              } @else {
                <span>ورود به پنل</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
              }
            </button>

            <div class="rounded-lg bg-brand-50 p-3 text-center">
              <p class="text-xs text-brand-800">
                <span class="font-semibold">اطلاع:</span> نام کاربری و رمز عبور به‌صورت پیش‌فرض وارد شده — فقط کافیه روی «ورود» کلیک کنید.
              </p>
            </div>
          </form>
        </div>
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
