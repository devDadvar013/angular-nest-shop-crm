import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Adds comma-separated thousands formatting to a number input while
 * keeping the underlying form value as a raw number.
 *
 * Usage: <input type="text" formControlName="price" appNumberFormat />
 */
@Directive({
  selector: 'input[appNumberFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFormatDirective),
      multi: true,
    },
  ],
})
export class NumberFormatDirective implements ControlValueAccessor {
  private onChange: (val: number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/,/g, '').trim();
    if (raw === '') {
      input.value = '';
      this.onChange(0);
      return;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    input.value = num.toLocaleString('en-US');
    this.onChange(num);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null | undefined): void {
    const num = value ?? 0;
    this.el.nativeElement.value = num ? num.toLocaleString('en-US') : '';
  }

  registerOnChange(fn: (val: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
