import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm animate-fade-in"
        (click)="cancelled.emit()"
      >
        <div
          class="card w-full max-w-sm p-6 shadow-2xl animate-slide-up"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 class="text-base font-semibold text-ink-900">{{ title }}</h3>
          <p class="mt-2 text-sm text-ink-500 leading-7">{{ message }}</p>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="btn-secondary" (click)="cancelled.emit()">انصراف</button>
            <button type="button" class="btn-danger" (click)="confirmed.emit()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'تایید حذف';
  @Input() message = 'از انجام این عملیات مطمئن هستید؟ این عملیات قابل بازگشت نیست.';
  @Input() confirmLabel = 'حذف';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
