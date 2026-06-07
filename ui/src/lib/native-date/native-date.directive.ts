import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'input[type=date][nativeDate]',
  standalone: true,
  host: {
    class: 'clr-input',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NativeDateValueAccessorDirective),
      multi: true,
    },
  ],
})
export class NativeDateValueAccessorDirective implements ControlValueAccessor {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  protected onChange = (_: Date | null): void => {
    // noop
  };
  protected onTouched = (): void => {
    // noop
  };

  @HostListener('change')
  protected handleChange(): void {
    // Нативный valueAsDate возвращает полночь по UTC. Приводим к часовому
    // поясу пользователя: создаём Date на локальную полночь выбранного дня.
    const value = this.element.nativeElement.value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.onChange(new Date(year, month - 1, day));
    } else {
      this.onChange(null);
    }
  }

  @HostListener('blur')
  protected handleBlur(): void {
    this.onTouched();
  }

  public writeValue(value: Date | null): void {
    // Форматируем Date в строку YYYY-MM-DD по локальным частям даты,
    // чтобы день не сдвигался из-за часового пояса.
    if (value instanceof Date && !isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      this.element.nativeElement.value = `${year}-${month}-${day}`;
    } else {
      this.element.nativeElement.value = '';
    }
  }

  public registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
