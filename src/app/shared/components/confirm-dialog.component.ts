import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4" (click)="cancelled.emit()">
        <div class="card w-full max-w-sm p-6" (click)="$event.stopPropagation()">
          <h3 class="text-base font-semibold text-ink-900">{{ title }}</h3>
          <p class="mt-2 text-sm text-ink-500 leading-6">{{ message }}</p>
          <div class="mt-6 flex justify-end gap-2">
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
