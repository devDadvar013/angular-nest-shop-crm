import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toman', standalone: true })
export class TomanPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '—';
    return `${value.toLocaleString('fa-IR')} تومان`;
  }
}
