import { formatDate } from '@angular/common';
import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NativeDateValueAccessorDirective } from '@sotbi/ui';
import { YYYY_MM_DD } from '@sotbi/utils';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import { isSameDay } from 'date-fns';

const parseTimeToMinutes = (value: string): number | null => {
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
};

const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'native-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NativeDateValueAccessorDirective, FormsModule],
  template: `
    <input
      #datePicker
      class="grid-picker px-2"
      [class.hide]="readonly()"
      type="date"
      nativeDate
      [attr.min]="min || null"
      [attr.max]="max || null"
      [(ngModel)]="value"
      [disabled]="disabled()"
    />
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
})
export class DatePickerEditor implements ICellEditorAngularComp {
  protected value: Date | null = null;
  public readonly disabled = input(false);
  protected min: string = formatDate(new Date(), YYYY_MM_DD, 'ru-RU');
  protected max: string = formatDate(new Date(), YYYY_MM_DD, 'ru-RU');
  protected readonly readonly = signal<boolean>(false);

  public agInit(params: ICellEditorParams<unknown, Date | null>): void {
    this.min = params['min'] ?? null;
    this.max = params['max'] ?? null;
    this.readonly.set(params['readonly']);
    if (this.min && this.max && isSameDay(this.min, this.max)) {
      this.value = new Date(this.min);
    } else {
      this.value = (params.value && new Date(params.value)) ?? null;
    }
  }

  public getValue(): Date | null {
    if (
      this.value &&
      (isNaN(Number(this.value?.getTime())) || this.value?.getTime() === 0)
    ) {
      return null;
    }
    return this.value ? new Date(this.value) : null;
  }

  public isPopup(): boolean {
    return false;
  }
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      #timePicker
      type="time"
      [attr.min]="min || null"
      [attr.max]="max || null"
      step="300"
      class="grid-picker px-2 border rounded"
      [(ngModel)]="value"
    />
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
  imports: [FormsModule],
})
export class TimePickerEditor implements ICellEditorAngularComp {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly timeInput =
    viewChild<ElementRef<HTMLInputElement>>('timePicker');

  protected value = '00:00';

  protected min: string | null = null;
  protected max: string | null = null;

  public agInit(params: ICellEditorParams): void {
    this.min = params['min'] ?? null;
    this.max = params['max'] ?? null;
    this.value = params.value ? formatMinutesToTime(params.value) : '00:00';
    this.cdr.markForCheck();
  }

  public afterGuiAttached(): void {
    const input = this.timeInput()?.nativeElement;
    input?.focus();
  }

  /**
   * AG Grid calls getValue() before blur/change on the native time input.
   * Read the live DOM value instead of waiting for ngModel to sync.
   */
  public getValue(): number {
    const inputValue = this.timeInput()?.nativeElement.value;
    if (!inputValue) {
      return parseTimeToMinutes(this.value) ?? 0;
    }
    return parseTimeToMinutes(inputValue) ?? 0;
  }

  public isPopup(): boolean {
    return false;
  }
}
