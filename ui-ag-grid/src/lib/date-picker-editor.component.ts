import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import {
  NativeDateValueAccessorDirective,
  NativeTimeValueAccessorDirective,
} from '@sotbi/ui';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';
import { isSameDay } from 'date-fns';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DateInputsModule,
    ReactiveFormsModule,
    NativeDateValueAccessorDirective,
    FormsModule,
  ],
  template: `
    <input
      #timePicker
      class="grid-picker"
      [class.hide]="readonly()"
      type="date"
      nativeDate
      [min]="min"
      [max]="max"
      [(ngModel)]="value"
      [disabled]="disabled()"
    />
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
})
export class DatePickerEditor implements ICellEditorAngularComp {
  protected value: Date | null = null;
  public readonly disabled = input(false);
  protected min: Date = new Date();
  protected max: Date = new Date();
  protected readonly readonly = signal<boolean>(false);

  public agInit(params: ICellEditorParams<unknown, Date | null>): void {
    this.min = (params['min'] && new Date(params['min'])) ?? null;
    this.max = (params['max'] && new Date(params['max'])) ?? null;
    this.readonly.set(params['readonly']);
    if (this.min && this.max && isSameDay(this.min, this.max)) {
      this.value = this.min;
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
      type="time"
      [min]="min"
      [max]="max"
      nativeTime
      step="10"
      [(ngModel)]="value"
    />
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
  imports: [FormsModule, NativeTimeValueAccessorDirective],
})
export class TimePickerEditor implements ICellEditorAngularComp {
  protected readonly value = signal<number>(0);

  protected min = '00:00';
  protected max = '23:59';
  protected steps = { hour: 1, minute: 10 };

  public agInit(params: ICellEditorParams): void {
    this.min = params['min'] ?? '00:00';
    this.max = params['max'] ?? '23:59';
    this.value.set(params.value ?? 0);
  }

  public getValue(): number {
    return this.value();
  }

  public isPopup(): boolean {
    return false;
  }
}
