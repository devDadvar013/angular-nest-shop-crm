import { Component, Input } from '@angular/core';
import { OrderStatus } from '../../core/models';

const COLOR_CLASSES: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  slate: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'amber',
  processing: 'blue',
  shipped: 'indigo',
  delivered: 'emerald',
  cancelled: 'rose',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="colorClass()">{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: OrderStatus;
  @Input() label = '';

  colorClass(): string {
    const color = STATUS_COLORS[this.status] ?? 'slate';
    return COLOR_CLASSES[color];
  }
}
