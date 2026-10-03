import { Component, Input, LOCALE_ID, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrIcon, ClrLoadingButtonModule, ClrLoadingModule } from '@clr/angular';
import { Interval } from '@sotbi/models';
import { FilterBlockComponent } from '../filter-block';
import { NativeDateValueAccessorDirective } from '../native-date';
import { DD_MM_YYYY, MM_YYYY } from '@sotbi/utils';

enum PeriodsType {
  TODAY,
  YESTERDAY,
  CURR_WEEK,
  LAST_7DAYS,
  CURR_MONTH,
  LAST_MONTH,
}

enum PeriodsTypeAnalytics {
  THREE_MONTHS,
  CURR_YEAR,
  THREE_YEARS,
  ALL_HUSTORY,
}

const PeriodsTypeArr = [
  {
    id: PeriodsType.TODAY,
    name: 'сегодня',
  },
  {
    id: PeriodsType.YESTERDAY,
    name: 'вчера',
  },
  {
    id: PeriodsType.CURR_WEEK,
    name: 'с пнд',
  },
  {
    id: PeriodsType.LAST_7DAYS,
    name: 'неделя',
  },
  {
    id: PeriodsType.CURR_MONTH,
    name: 'с 1-го',
  },
  {
    id: PeriodsType.LAST_MONTH,
    name: 'месяц',
  },
];

const PeriodsTypeAnalyticsArr = [
  {
    id: PeriodsTypeAnalytics.THREE_MONTHS,
    name: '3 месяца',
  },
  {
    id: PeriodsTypeAnalytics.CURR_YEAR,
    name: 'текущий год',
  },
  {
    id: PeriodsTypeAnalytics.THREE_YEARS,
    name: '3 года',
  },
  {
    id: PeriodsTypeAnalytics.ALL_HUSTORY,
    name: 'За всю историю',
  },
];

const ruDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
  day: 'numeric',
});

// formatRange появился в lib es2021.intl; целевые lib проекта его не объявляют
type RangeFormatter = Intl.DateTimeFormat & {
  formatRange(start: Date, end: Date): string;
};
const ruRangeFormatter = ruDateFormatter as RangeFormatter;

@Component({
  selector: 'range-date',
  templateUrl: './range-date.component.html',
  styleUrls: ['./range-date.component.scss'],
  imports: [
    FilterBlockComponent,
    FormsModule,
    ClrIcon,
    ClrLoadingButtonModule,
    ClrLoadingModule,
    NativeDateValueAccessorDirective,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'ru' }],
})
export class RangeDateComponent implements OnInit {
  protected readonly periodsTypeArr = PeriodsTypeArr;
  protected readonly PeriodsTypeAnalyticsArr = PeriodsTypeAnalyticsArr;
  protected readonly MM_YYYY = MM_YYYY;
  protected readonly DD_MM_YYYY = DD_MM_YYYY;

  public readonly selected = output<Interval>();
  public readonly selectedFromDataPicker = output<Interval>();
  public readonly confirm = output();
  public readonly analytics = input(false);
  public readonly loading = input(false);
  public readonly showButton = input(true);
  @Input() public start = new Date();
  @Input() public end = new Date();

  get selectedPeriod(): string {
    return (
      (this.end &&
        'Выбрано: ' + ruRangeFormatter.formatRange(this.start, this.end)) ||
      'период не выбран'
    );
  }

  public ngOnInit(): void {
    if (this.analytics()) {
      this.start.setDate(1);
      this.start.setMonth(this.start.getMonth() - 1);
      this.end.setDate(1);
    }
  }

  protected filterByDate(value: number, analytics = false) {
    if (!analytics) {
      switch (value) {
        case PeriodsType.TODAY:
          this.start = new Date();
          this.end = new Date();
          break;
        case PeriodsType.YESTERDAY:
          this.start = new Date();
          this.start.setDate(this.start.getDate() - 1);
          this.end = new Date();
          this.end.setDate(this.end.getDate() - 1);
          break;
        case PeriodsType.CURR_WEEK:
          this.start = new Date();
          this.start.setDate(
            this.start.getDate() - this.start.getDay() + (this.start.getDay() === 0 ? -6 : 1),
          );
          this.end = new Date();
          break;
        case PeriodsType.LAST_7DAYS:
          this.start = new Date();
          this.start.setDate(this.start.getDate() - 7);
          this.end = new Date();
          break;
        case PeriodsType.CURR_MONTH:
          this.start = new Date();
          this.start.setDate(1);
          this.end = new Date();
          break;
        case PeriodsType.LAST_MONTH:
          this.start = new Date();
          this.start.setMonth(this.start.getMonth() - 1);
          this.end = new Date();
          break;
      }
    } else {
      // для flexmonster
      switch (value) {
        case PeriodsTypeAnalytics.THREE_MONTHS:
          this.start = new Date();
          this.start.setDate(1);
          this.start.setMonth(this.start.getMonth() - 3);
          this.end = new Date();
          this.end.setDate(1);
          break;
        case PeriodsTypeAnalytics.CURR_YEAR:
          this.start = new Date();
          this.start.setDate(1);
          this.start.setMonth(0);
          this.end = new Date();
          this.end.setDate(1);
          break;
        case PeriodsTypeAnalytics.THREE_YEARS:
          this.start = new Date();
          this.start.setDate(1);
          this.start.setFullYear(this.start.getFullYear() - 3);
          this.end = new Date();
          this.end.setDate(1);
          break;
        case PeriodsTypeAnalytics.ALL_HUSTORY:
          this.start = new Date();
          this.start.setFullYear(2012, 0, 1);
          this.end = new Date();
          this.end.setDate(1);
          break;
      }
    }

    this.check();
    this.selected.emit({ start: this.start, end: this.end });
  }

  protected dateChange() {
    this.check();
    this.selectedFromDataPicker.emit({ start: this.start, end: this.end });
  }

  private check() {
    if (this.start > this.end) {
      [this.start, this.end] = [this.end, this.start];
    }
  }

  protected getData() {
    this.confirm.emit();
  }
}
