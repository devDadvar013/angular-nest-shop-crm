import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'faDate', standalone: true })
export class FaDatePipe implements PipeTransform {
  transform(value: string | null | undefined, withTime = true): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return new Intl.DateTimeFormat('fa-IR', opts).format(date);
  }
}
