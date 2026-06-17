import {
  Directive,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[type=datetime-local][nativeDateTime]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NativeDateTimeValueAccessorDirective),
      multi: true,
    },
  ],
})
export class NativeDateTimeValueAccessorDirective implements ControlValueAccessor {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  protected onChange = (_: Date | null): void => {
    // noop
  };
  protected onTouched = (): void => {
    // noop
  };

  @HostListener('change')
  protected handleChange(): void {
    this.commitValue();
  }

  @HostListener('blur')
  protected handleBlur(): void {
    this.commitValue();
    this.onTouched();
  }

  public writeValue(value: Date | string | null): void {
    if (!value) {
      this.element.nativeElement.value = '';
      return;
    }

    let date: Date | null = null;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' && value) {
      date = new Date(value);
    }

    if (date && !isNaN(date.getTime())) {
      this.element.nativeElement.value = this.formatDateTime(date);
      return;
    }

    this.element.nativeElement.value = '';
  }

  public registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.element.nativeElement.disabled = isDisabled;
  }

  private commitValue(): void {
    const value = this.element.nativeElement.value;
    if (value) {
      this.onChange(this.parseDateTime(value));
      return;
    }

    this.onChange(null);
  }

  private parseDateTime(value: string): Date | null {
    const [datePart, timePart] = value.split('T');
    if (!datePart || !timePart) {
      console.error('Invalid date time value:', value);
      return null;
    }
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    if (
      isNaN(year) ||
      isNaN(month) ||
      isNaN(day) ||
      isNaN(hour) ||
      isNaN(minute)
    ) {
      console.error('Invalid date time value:', value);
      return null;
    }
    return new Date(year, month - 1, day, hour, minute);
  }

  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }
}
