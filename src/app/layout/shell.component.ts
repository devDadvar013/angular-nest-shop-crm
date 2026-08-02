import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { ToastContainerComponent } from '../shared/components/toast-container.component';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, ToastContainerComponent],
  template: `
    <div class="flex min-h-screen bg-ink-50">
      <!-- Sidebar (RTL: on the right side) -->
      <aside
        class="fixed inset-y-0 right-0 z-40 w-72 shrink-0 border-l border-ink-100 bg-white shadow-xl transition-transform duration-300 ease-out lg:static lg:!translate-x-0 lg:shadow-none"
        [class.translate-x-0]="sidebarOpen()"
        [class.translate-x-full]="!sidebarOpen()"
      >
        <div class="flex h-16 items-center gap-3 border-b border-ink-100 px-5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-sm">ش</div>
          <div>
            <p class="text-sm font-bold text-ink-900 leading-tight">شاپ سی‌آرام</p>
            <p class="text-[11px] text-ink-400 leading-tight">مدیریت فروشگاه</p>
          </div>
        </div>
        <nav class="flex flex-col gap-1 p-3">
          <p class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-400">منو</p>
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-brand-50 text-brand-700 shadow-sm"
              [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
              class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 transition-all hover:bg-ink-50 hover:text-ink-900"
              (click)="sidebarOpen.set(false)"
            >
              <span class="text-base transition-transform group-hover:scale-110">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>

      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-ink-900/50 backdrop-blur-sm transition-opacity lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main -->
      <div class="flex min-h-screen flex-1 flex-col">
        <header class="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-ink-100 bg-white/80 px-3 backdrop-blur sm:px-6">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 lg:hidden"
              (click)="sidebarOpen.set(true)"
              aria-label="باز کردن منو"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="hidden text-left sm:block">
              <p class="text-sm font-medium text-ink-800 leading-tight">{{ auth.user()?.name }}</p>
              <p class="text-[11px] text-ink-400 leading-tight">{{ auth.user()?.email }}</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-bold text-brand-700 ring-2 ring-white">
              {{ initials() }}
            </div>
            <button type="button" class="btn-secondary !px-3" (click)="logout()">
              <span class="hidden sm:inline">خروج</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:hidden">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </header>

        <main class="flex-1 p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-toast-container />
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly sidebarOpen = signal(false);

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'داشبورد', icon: '📊' },
    { path: '/orders', label: 'سفارش‌ها', icon: '🧾' },
    { path: '/products', label: 'محصولات', icon: '📦' },
    { path: '/customers', label: 'مشتریان', icon: '👥' },
  ];

  initials(): string {
    const name = this.auth.user()?.name ?? '';
    return name.trim().slice(0, 1) || '؟';
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        this.toast.info('با موفقیت خارج شدید.');
        this.router.navigateByUrl('/login');
      },
      error: () => {
        this.auth.logoutLocally();
        this.toast.info('با موفقیت خارج شدید.');
        this.router.navigateByUrl('/login');
      },
    });
  }
}
