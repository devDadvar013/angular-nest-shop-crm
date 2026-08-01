import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
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
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 right-0 z-30 w-64 shrink-0 -translate-x-full border-l border-ink-100 bg-white transition-transform lg:static lg:translate-x-0"
        [class.translate-x-0]="sidebarOpen()"
      >
        <div class="flex h-16 items-center gap-2 border-b border-ink-100 px-5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">ش</div>
          <span class="text-base font-bold text-ink-900">شاپ سی‌آرام</span>
        </div>
        <nav class="flex flex-col gap-1 p-3">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-brand-50 text-brand-700"
              [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
              class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50"
              (click)="sidebarOpen.set(false)"
            >
              <span class="text-base">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
      </aside>

      @if (sidebarOpen()) {
        <div class="fixed inset-0 z-20 bg-ink-900/30 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main -->
      <div class="flex min-h-screen flex-1 flex-col lg:mr-0">
        <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-ink-100 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button type="button" class="btn-ghost lg:hidden" (click)="sidebarOpen.set(true)">☰</button>
          <div class="hidden text-sm text-ink-500 lg:block"></div>
          <div class="flex items-center gap-3">
            <div class="hidden text-left sm:block">
              <p class="text-sm font-medium text-ink-800">{{ auth.user()?.name }}</p>
              <p class="text-xs text-ink-400">{{ auth.user()?.email }}</p>
            </div>
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {{ initials() }}
            </div>
            <button type="button" class="btn-secondary" (click)="logout()">خروج</button>
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
      error: () => this.auth.logoutLocally(),
    });
  }
}
