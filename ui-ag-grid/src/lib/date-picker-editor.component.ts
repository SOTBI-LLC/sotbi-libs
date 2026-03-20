import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
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
      [class.hide]="readonly"
      [min]="min"
      [max]="max"
      [footer]="true"
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
      <ng-template kendoCalendarFooterTemplate let-date="date">
        <button
          class="btn btn-primary"
          (click)="clearDate()"
          aria-label="Очистить"
          alt="Очистить"
        >
          🗑️
        </button>
      </ng-template>
    </kendo-datepicker>
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
})
export class DatePickerEditor implements ICellEditorAngularComp {
  #value: Date | null = null;
  public readonly disabled = input(false);
  public readonly ourFormControl = input(new FormControl<Date | null>(null));
  @Input() public set value(value: Date | null) {
    this.#value = value ? new Date(value) : null;
    this.ourFormControl().setValue(this.#value, { emitEvent: false });
  }
  public get value(): Date | null {
    return this.#value ? this.#value : null;
  }
  protected min: Date = new Date();
  protected max: Date = new Date();
  protected readonly = false;
  protected readonly format = DD_MM_YYYY;
  public readonly dateChange = output<Date | null>();

  public agInit(params: ICellEditorParams): void {
    this.min = (params['min'] && new Date(params['min'])) || null;
    this.max = (params['max'] && new Date(params['max'])) || null;
    this.readonly = params['readonly'];
    if (isSameDay(this.min, this.max)) {
      this.value = this.min;
    } else {
      this.value = (params.value && new Date(params.value)) || null;
    }
  }

  protected clearDate() {
    this.value = null;
    this.dateChange.emit(null);
  }

  public dateChanged(value: Date) {
    this.value = new Date(value);
    this.dateChange.emit(value);
  }

  public getValue(): Date | null {
    if (isNaN(Number(this.value?.getTime()))) {
      return null;
    }
    return this.value;
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
      <ng-template kendoCalendarFooterTemplate let-date="date">
        <span class="highlight-template">{{ date | date }}</span>
      </ng-template>
    </kendo-timepicker>
  `,
  styleUrls: ['./date-picker-editor.component.scss'],
  imports: [
    TimePickerComponent,
    DateTimePickerCustomMessagesComponent,
    DatePipe,
  ],
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
