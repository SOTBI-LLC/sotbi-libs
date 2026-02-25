import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import type {
  ActualAccount,
  IPaymentDocumentFilter,
  Label,
} from '@sotbi/models';

export enum BeetwenType {
  TODAY = 1,
  CURR_WEEK,
  LAST_7DAYS,
  CURR_MONTH,
  LAST_MONTH,
  CUSTOM,
}

@Component({
  selector: 'payments-filter',
  imports: [ClarityModule, FormsModule, NgSelectModule],
  templateUrl: './payments-filter.component.html',
  styleUrl: './payments-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsFilterComponent {
  public readonly filterEvent = output<Partial<IPaymentDocumentFilter>>();

  public readonly filter = input<Partial<IPaymentDocumentFilter>>({
    start: new Date(),
    end: new Date(),
    between: BeetwenType.TODAY,
  });

  public readonly actuals = input<ActualAccount[]>([]);
  public readonly labels = input<Label[]>([]);

  protected readonly internalFilter = signal<Partial<IPaymentDocumentFilter>>({
    start: new Date(),
    end: new Date(),
    between: BeetwenType.TODAY,
  });

  protected readonly between = signal<BeetwenType>(BeetwenType.TODAY);

  private isInternalUpdate = false;
  protected readonly beetwenType = BeetwenType;

  constructor() {
    // Sync external filter input to internal filter, but avoid circular updates
    effect(() => {
      const externalFilter = this.filter();
      if (!externalFilter || this.isInternalUpdate) {
        return;
      }

      // Only update if the external filter is actually different
      const current = this.internalFilter();
      if (JSON.stringify(current) !== JSON.stringify(externalFilter)) {
        this.internalFilter.set({ ...externalFilter });
      }
    });
  }

  protected onLabelIDChanged(items: Label[]): void {
    this.updateFilter({ label_id: items.map((el: Label) => el.id) });
  }

  protected onBankDetailIDChanged(items: ActualAccount[]): void {
    this.updateFilter({
      bank_detail_id: items.map((el: ActualAccount) => el.id ?? 0) ?? [],
    });
  }

  protected onBankDetailIDClear(): void {
    this.isInternalUpdate = true;
    const updatedFilter = { ...this.internalFilter() };
    delete updatedFilter.bank_detail_id;
    this.internalFilter.set(updatedFilter);
    this.filterEvent.emit(this.internalFilter());
    Promise.resolve().then(() => {
      this.isInternalUpdate = false;
    });
  }

  protected onLabelIDClear(): void {
    this.isInternalUpdate = true;
    const updatedFilter = { ...this.internalFilter() };
    delete updatedFilter.label_id;
    this.internalFilter.set(updatedFilter);
    this.filterEvent.emit(this.internalFilter());
    Promise.resolve().then(() => {
      this.isInternalUpdate = false;
    });
  }

  protected dateStartChange(value: Date) {
    this.updateFilter({ start: value });
  }

  protected dateEndChange(value: Date) {
    this.updateFilter({ end: value });
  }

  private updateFilter(partialFilter: Partial<IPaymentDocumentFilter>): void {
    // Mark this as an internal update to prevent the effect from triggering
    this.isInternalUpdate = true;

    this.internalFilter.set({ ...this.internalFilter(), ...partialFilter });
    this.filterEvent.emit(this.internalFilter());

    // Reset the flag after a microtask to allow the effect to run again
    Promise.resolve().then(() => {
      this.isInternalUpdate = false;
    });
  }

  protected filterByDateBetween(value: number) {
    const filter: Partial<IPaymentDocumentFilter> = {};
    switch (value) {
      case BeetwenType.TODAY:
        filter.start = new Date();
        filter.end = new Date();
        break;
      case BeetwenType.CURR_WEEK:
        filter.start = new Date();
        filter.start.setDate(
          filter.start.getDate() -
            filter.start.getDay() +
            (filter.start.getDay() === 0 ? -6 : 1),
        );
        filter.end = new Date();
        break;
      case BeetwenType.LAST_7DAYS:
        filter.start = new Date();
        filter.start.setDate(filter.start.getDate() - 7);
        filter.end = new Date();
        break;
      case BeetwenType.CURR_MONTH:
        filter.start = new Date();
        filter.start.setDate(1);
        filter.end = new Date();
        break;
      case BeetwenType.LAST_MONTH:
        filter.start = new Date();
        filter.start.setMonth(filter.start.getMonth() - 1);
        filter.end = new Date();
        break;
      case BeetwenType.CUSTOM:
      default:
        filter.start = new Date();
        filter.end = new Date();
        break;
    }
    this.updateFilter(filter);
  }
}
