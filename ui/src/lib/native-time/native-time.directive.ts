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
  selector: 'input[type=time][nativeTime]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NativeTimeValueAccessorDirective),
      multi: true,
    },
  ],
})
export class NativeTimeValueAccessorDirective implements ControlValueAccessor {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  protected onChange = (_: number | null): void => {
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

  public writeValue(value: number | string | null): void {
    if (value === null || value === '') {
      this.element.nativeElement.value = '';
      return;
    }

    const minutes =
      typeof value === 'number' ? value : this.parseTimeToMinutes(value);
    if (minutes === null || minutes < 0 || minutes >= 24 * 60) {
      this.element.nativeElement.value = '';
      return;
    }

    this.element.nativeElement.value = this.formatMinutesToTime(minutes);
  }

  public registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private commitValue(): void {
    const value = this.element.nativeElement.value;
    if (value) {
      this.onChange(this.parseTimeToMinutes(value));
    } else {
      this.onChange(null);
    }
  }

  private parseTimeToMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const hours = Number(match[1]);
    const mins = Number(match[2]);
    if (hours > 23 || mins > 59) {
      return null;
    }
    return hours * 60 + mins;
  }

  private formatMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}
