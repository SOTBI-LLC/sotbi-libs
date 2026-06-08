import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BetweenType, PaymentsFilter, type ActualAccount, type Label } from '@sotbi/models';
import { deepEqual } from '@sotbi/utils';
import { NativeDateValueAccessorDirective } from '../native-date/native-date.directive';

@Component({
  selector: 'payments-filter',
  imports: [FormsModule, NgSelectModule, ReactiveFormsModule, NativeDateValueAccessorDirective],
  templateUrl: './payments-filter.component.html',
  styleUrl: './payments-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsFilterComponent {
  public readonly filterEvent = output<PaymentsFilter>();

  public readonly filter = input<PaymentsFilter>(new PaymentsFilter());

  public readonly actuals = input<ActualAccount[]>([]);
  public readonly labels = input<Label[]>([]);

  protected readonly filterForm = new FormGroup({
    start: new FormControl<Date>(new Date(), [Validators.required]),
    end: new FormControl<Date>(new Date(), [Validators.required]),
    between: new FormControl<BetweenType>(BetweenType.TODAY, [Validators.required]),
    label_id: new FormControl<number[] | null>(null),
    bank_detail_id: new FormControl<number[] | null>(null),
  });
  protected readonly between = signal<BetweenType>(BetweenType.TODAY);
  protected readonly beetwenType = BetweenType;

  constructor() {
    // Sync external filter input to internal filter, but avoid circular updates
    effect(() => {
      const externalFilter = this.filter();
      if (!externalFilter) {
        return;
      }

      // Only update if the external filter is actually different
      const current = this.filterForm.value;
      if (!deepEqual(current, externalFilter)) {
        this.filterForm.patchValue(externalFilter);
        if (externalFilter.between != null) {
          this.between.set(externalFilter.between);
        }
      }
    });
  }

  protected onLabelIDChanged(items: Label[]): void {
    this.filterForm.patchValue({ label_id: items.map((el: Label) => el.id) });
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }

  protected onBankDetailIDChanged(items: ActualAccount[]): void {
    this.filterForm.patchValue({
      bank_detail_id: items.map((el: ActualAccount) => el.id ?? 0) ?? [],
    });
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }

  protected onBankDetailIDClear(): void {
    this.filterForm.patchValue({ bank_detail_id: null });
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }

  protected onLabelIDClear(): void {
    this.filterForm.patchValue({ label_id: null });
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }

  protected onCustomDateChange(): void {
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }

  protected filterByDateBetween(value: BetweenType) {
    this.between.set(value);
    const filter = new PaymentsFilter();
    switch (value as BetweenType) {
      case BetweenType.CURR_WEEK:
        filter.start = new Date();
        filter.start.setDate(filter.start.getDate() - filter.start.getDay() + (filter.start.getDay() === 0 ? -6 : 1));
        filter.end = new Date();
        break;
      case BetweenType.LAST_7DAYS:
        filter.start = new Date();
        filter.start.setDate(filter.start.getDate() - 7);
        filter.end = new Date();
        break;
      case BetweenType.CURR_MONTH:
        filter.start = new Date();
        filter.start.setDate(1);
        filter.end = new Date();
        break;
      case BetweenType.LAST_MONTH:
        filter.start = new Date();
        filter.start.setMonth(filter.start.getMonth() - 1);
        filter.end = new Date();
        break;
    }
    this.filterForm.patchValue({ start: filter.start, end: filter.end });
    this.filterEvent.emit(this.filterForm.value as PaymentsFilter);
  }
}
