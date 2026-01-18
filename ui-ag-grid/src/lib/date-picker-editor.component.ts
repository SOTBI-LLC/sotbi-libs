import { Component, computed, Input, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  DateInputFormatPlaceholder,
  DateInputsModule,
  DateTimePickerCustomMessagesComponent,
  TimePickerComponent,
} from '@progress/kendo-angular-dateinputs';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridApi, ICellEditorParams } from 'ag-grid-community';
import { isSameDay } from 'date-fns';
import { DD_MM_YYYY } from '../shared-globals';

@Component({
  selector: 'our-kendo-datepicker',
  imports: [DateInputsModule, ReactiveFormsModule],
  template: `
    <kendo-datepicker
      #timePicker
      class="grid-picker"
      [class.hide]="readonly"
      [min]="min"
      [max]="max"
      placeholder="дд.мм.гггг"
      [navigation]="false"
      [value]="value"
      [formControl]="ourFormControl()"
      (valueChange)="dateChanged($event)"
      [readOnlyInput]="!!readonly"
      [format]="format"
      [disabled]="disabled()"
      (click)="readonly ? timePicker.toggle() : ''"
    >
      <kendo-datepicker-messages today="Сегодня" toggle="Показать календарь" />
    </kendo-datepicker>
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
})
export class DatePickerEditor implements ICellEditorAngularComp {
  #value: Date | null = null;
  public readonly disabled = input(false);
  public readonly ourFormControl = input(new FormControl<Date | null>(null));
  @Input() set value(value: Date) {
    this.#value = value ? new Date(value) : null;
    this.ourFormControl().setValue(this.#value, { emitEvent: false });
  }
  get value(): Date {
    return this.#value ? this.#value : null;
  }
  min: Date;
  max: Date;
  readonly = false;
  readonly format = DD_MM_YYYY;
  private api: GridApi;
  public readonly dateChange = output<Date>();

  agInit(params: ICellEditorParams): void {
    this.api = params.api;
    this.min = (params['min'] && new Date(params['min'])) || null;
    this.max = (params['max'] && new Date(params['max'])) || null;
    this.readonly = params['readonly'];
    if (isSameDay(this.min, this.max)) {
      this.value = this.min;
    } else {
      this.value = (params.value && new Date(params.value)) || null;
    }
  }

  dateChanged(value: Date) {
    this.value = new Date(value);
    this.ourFormControl()?.setValue(value);
    this.dateChange.emit(value);
  }

  getValue(): Date {
    if (isNaN(this.value?.getTime())) {
      return new Date();
    }
    return this.value;
  }

  isPopup(): boolean {
    return false;
  }
}

@Component({
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
    () => new Date(0, 0, 0, Math.floor(this.value() / 60), this.value() % 60, 0),
  );

  min = 1;
  max = 1439; // 23:59
  steps = { hour: 1, minute: 10 };
  formatPlaceholder: DateInputFormatPlaceholder = {
    hour: '00',
    minute: '00',
    second: '00',
    year: '2024',
    month: '00',
    day: '00',
    millisecond: '0',
  };
  private api: GridApi;

  onChange(value: Date): void {
    console.log(value);
    this.value.set(value.getHours() * 60 + value.getMinutes());
  }

  agInit(params: ICellEditorParams): void {
    this.api = params.api;
    this.min = params['min'] ?? 1;
    this.max = params['max'] ?? 1439;
    this.value.set(params.value ?? 0);
  }

  getValue(): number {
    return this.value();
  }

  isPopup(): boolean {
    return false;
  }
}
