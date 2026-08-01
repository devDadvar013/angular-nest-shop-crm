import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pl-4 sm:pr-8">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all"
          [class]="kindClass(toast.kind)"
        >
          <span class="mt-0.5 shrink-0">
            @switch (toast.kind) {
              @case ('success') { <span>✓</span> }
              @case ('error') { <span>✕</span> }
              @default { <span>ℹ</span> }
            }
          </span>
          <p class="flex-1 text-sm leading-6">{{ toast.message }}</p>
          <button
            type="button"
            class="shrink-0 rounded p-1 text-current/60 hover:text-current"
            (click)="toasts.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toasts = inject(ToastService);

  kindClass(kind: 'success' | 'error' | 'info'): string {
    switch (kind) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-brand-50 border-brand-200 text-brand-800';
    }
  }
}
