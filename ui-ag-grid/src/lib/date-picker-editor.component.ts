import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { DateInputFormatPlaceholder } from '@progress/kendo-angular-dateinputs';
import {
  DateInputsModule,
  DateTimePickerCustomMessagesComponent,
  TimePickerComponent,
} from '@progress/kendo-angular-dateinputs';
import { DD_MM_YYYY } from '@sotbi/utils';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { GridApi, ICellEditorParams } from 'ag-grid-community';
import { isSameDay } from 'date-fns';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DateInputsModule, ReactiveFormsModule],
  template: `
    <kendo-datepicker
      #timePicker
      class="grid-picker"
      [class.hide]="readonly()"
      [min]="min"
      [max]="max"
      [format]="format"
      [formatPlaceholder]="{
        year: 'ГГГГ',
        month: 'ММ',
        day: 'ДД',
      }"
      [navigation]="false"
      [value]="value"
      (valueChange)="dateChanged($event)"
      [readOnlyInput]="readonly()"
      [format]="format"
      [disabled]="disabled()"
      [clearButton]="true"
    >
      <kendo-datepicker-messages today="Сегодня" toggle="Показать календарь" />
    </kendo-datepicker>
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
})
export class DatePickerEditor implements ICellEditorAngularComp {
  protected value: Date | null = null;
  public readonly disabled = input(false);
  protected min: Date = new Date();
  protected max: Date = new Date();
  protected readonly readonly = signal<boolean>(false);
  protected readonly format = DD_MM_YYYY;
  public readonly dateChange = output<Date | null>();
  private api: GridApi | null = null;

  public agInit(params: ICellEditorParams<unknown, Date | null>): void {
    this.min = (params['min'] && new Date(params['min'])) ?? null;
    this.max = (params['max'] && new Date(params['max'])) ?? null;
    this.readonly.set(params['readonly']);
    this.api = params.api;
    if (this.min && this.max && isSameDay(this.min, this.max)) {
      this.value = this.min;
    } else {
      this.value = (params.value && new Date(params.value)) ?? null;
    }
  }

  protected dateChanged(value: Date | null) {
    this.value = value ? new Date(value) : null;
    this.dateChange.emit(this.value);
    this.api?.stopEditing();
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
    <kendo-timepicker
      class="grid-picker"
      format="HH:mm"
      [value]="display()"
      [formatPlaceholder]="formatPlaceholder"
      [cancelButton]="false"
      [nowButton]="false"
      [steps]="steps"
      (valueChange)="onChange($event)"
    >
      <kendo-datetimepicker-messages accept="ВЫБРАТЬ" acceptLabel="Выбрать">
      </kendo-datetimepicker-messages>
    </kendo-timepicker>
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
  imports: [TimePickerComponent, DateTimePickerCustomMessagesComponent],
})
export class TimePickerEditor implements ICellEditorAngularComp {
  private readonly value = signal<number>(0);
  protected readonly display = computed(
    () =>
      new Date(0, 0, 0, Math.floor(this.value() / 60), this.value() % 60, 0),
  );

  protected min = 1;
  protected max = 1439; // 23:59
  protected steps = { hour: 1, minute: 10 };
  protected formatPlaceholder: DateInputFormatPlaceholder = {
    hour: '00',
    minute: '00',
    second: '00',
    year: '2024',
    month: '00',
    day: '00',
    millisecond: '0',
  };
  private api: GridApi | null = null;

  public onChange(value: Date): void {
    console.log(value);
    this.value.set(value.getHours() * 60 + value.getMinutes());
  }

  public agInit(params: ICellEditorParams): void {
    this.api = params.api;
    this.min = params['min'] ?? 1;
    this.max = params['max'] ?? 1439;
    this.value.set(params.value ?? 0);
  }

  public getValue(): number {
    return this.value();
  }

  public isPopup(): boolean {
    return false;
  }
}
