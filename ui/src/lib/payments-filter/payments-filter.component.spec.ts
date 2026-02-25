import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type {
  ActualAccount,
  IPaymentDocumentFilter,
  Label,
} from '@sotbi/models';
import {
  BeetwenType,
  PaymentsFilterComponent,
} from './payments-filter.component';

describe('PaymentsFilterComponent', () => {
  let component: PaymentsFilterComponent;
  let fixture: ComponentFixture<PaymentsFilterComponent>;

  const mockLabels: Label[] = [
    { id: 1, name: 'Входящие', color: '#00ff00', description: null },
    { id: 2, name: 'Исходящие', color: '#ff0000', description: null },
    { id: 3, name: 'Комиссия банка', color: '#0000ff', description: null },
  ];

  const mockActuals: ActualAccount[] = [
    { id: 1, name: 'Счет 40702810...' },
    { id: 2, name: 'Счет 40703810...' },
    { id: 3, name: 'Счет 40704810...' },
  ];

  // Helper to access protected/private members
  const getPrivateProp = <T>(obj: PaymentsFilterComponent, prop: string): T => {
    return (obj as unknown as Record<string, T>)[prop];
  };

  const callProtectedMethod = <T>(
    obj: PaymentsFilterComponent,
    method: string,
    ...args: unknown[]
  ): T => {
    return (obj as unknown as Record<string, (...a: unknown[]) => T>)[method](
      ...args,
    );
  };

  beforeEach(async () => {
    // Override template to avoid complex Clarity/ng-select dependencies
    TestBed.overrideComponent(PaymentsFilterComponent, {
      set: {
        template: `
          <div class="payments-filter">
            <div class="filter-mock">Payments Filter Mock</div>
          </div>
        `,
      },
    });

    await TestBed.configureTestingModule({
      imports: [PaymentsFilterComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('inputs', () => {
    describe('filter input', () => {
      it('should have default filter with today date and TODAY between type', () => {
        fixture.detectChanges();

        const filter = component.filter();
        expect(filter.between).toBe(BeetwenType.TODAY);
        expect(filter.start).toBeInstanceOf(Date);
        expect(filter.end).toBeInstanceOf(Date);
      });

      it('should accept custom filter input', () => {
        const customFilter: Partial<IPaymentDocumentFilter> = {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
          between: BeetwenType.CURR_MONTH,
          label_id: [1, 2],
        };

        fixture.componentRef.setInput('filter', customFilter);
        fixture.detectChanges();

        expect(component.filter()).toEqual(customFilter);
      });
    });

    describe('actuals input', () => {
      it('should have empty array by default', () => {
        fixture.detectChanges();
        expect(component.actuals()).toEqual([]);
      });

      it('should accept actuals input', () => {
        fixture.componentRef.setInput('actuals', mockActuals);
        fixture.detectChanges();

        expect(component.actuals()).toEqual(mockActuals);
        expect(component.actuals().length).toBe(3);
      });
    });

    describe('labels input', () => {
      it('should have empty array by default', () => {
        fixture.detectChanges();
        expect(component.labels()).toEqual([]);
      });

      it('should accept labels input', () => {
        fixture.componentRef.setInput('labels', mockLabels);
        fixture.detectChanges();

        expect(component.labels()).toEqual(mockLabels);
        expect(component.labels().length).toBe(3);
      });
    });
  });

  describe('filterEvent output', () => {
    it('should emit filter when label changes', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onLabelIDChanged', [
        mockLabels[0],
        mockLabels[1],
      ]);

      expect(emittedFilters.length).toBe(1);
      expect(emittedFilters[0].label_id).toEqual([1, 2]);
    });

    it('should emit filter when bank detail changes', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onBankDetailIDChanged', [mockActuals[0]]);

      expect(emittedFilters.length).toBe(1);
      expect(emittedFilters[0].bank_detail_id).toEqual([1]);
    });

    it('should emit filter when date changes', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];
      const newDate = new Date('2024-06-15');

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'dateStartChange', newDate);

      expect(emittedFilters.length).toBe(1);
      expect(emittedFilters[0].start).toEqual(newDate);
    });
  });

  describe('internalFilter signal', () => {
    it('should initialize with default values', () => {
      fixture.detectChanges();

      const internalFilter = getPrivateProp<
        () => Partial<IPaymentDocumentFilter>
      >(component, 'internalFilter')();

      expect(internalFilter.between).toBe(BeetwenType.TODAY);
      expect(internalFilter.start).toBeInstanceOf(Date);
      expect(internalFilter.end).toBeInstanceOf(Date);
    });

    it('should sync with external filter input', () => {
      const customFilter: Partial<IPaymentDocumentFilter> = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
        between: BeetwenType.CURR_MONTH,
      };

      fixture.componentRef.setInput('filter', customFilter);
      fixture.detectChanges();

      const internalFilter = getPrivateProp<
        () => Partial<IPaymentDocumentFilter>
      >(component, 'internalFilter')();

      expect(internalFilter.between).toBe(BeetwenType.CURR_MONTH);
    });
  });

  describe('between signal', () => {
    it('should initialize with TODAY', () => {
      fixture.detectChanges();

      const between = getPrivateProp<() => BeetwenType>(component, 'between')();
      expect(between).toBe(BeetwenType.TODAY);
    });
  });

  describe('onLabelIDChanged', () => {
    it('should update filter with selected label ids', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onLabelIDChanged', mockLabels);

      expect(emittedFilters[0].label_id).toEqual([1, 2, 3]);
    });

    it('should emit empty array when no labels selected', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onLabelIDChanged', []);

      expect(emittedFilters[0].label_id).toEqual([]);
    });
  });

  describe('onBankDetailIDChanged', () => {
    it('should update filter with selected bank detail ids', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onBankDetailIDChanged', mockActuals);

      expect(emittedFilters[0].bank_detail_id).toEqual([1, 2, 3]);
    });

    it('should handle single account selection', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'onBankDetailIDChanged', [mockActuals[1]]);

      expect(emittedFilters[0].bank_detail_id).toEqual([2]);
    });
  });

  describe('onBankDetailIDClear', () => {
    it('should remove bank_detail_id from filter', () => {
      fixture.detectChanges();

      // First set bank detail
      callProtectedMethod(component, 'onBankDetailIDChanged', mockActuals);

      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];
      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      // Then clear it
      callProtectedMethod(component, 'onBankDetailIDClear');

      expect(emittedFilters[0].bank_detail_id).toBeUndefined();
    });
  });

  describe('onLabelIDClear', () => {
    it('should remove label_id from filter', () => {
      fixture.detectChanges();

      // First set labels
      callProtectedMethod(component, 'onLabelIDChanged', mockLabels);

      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];
      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      // Then clear it
      callProtectedMethod(component, 'onLabelIDClear');

      expect(emittedFilters[0].label_id).toBeUndefined();
    });
  });

  describe('dateStartChange', () => {
    it('should update start date in filter', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];
      const newDate = new Date('2024-03-15');

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'dateStartChange', newDate);

      expect(emittedFilters[0].start).toEqual(newDate);
    });
  });

  describe('dateEndChange', () => {
    it('should update end date in filter', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];
      const newDate = new Date('2024-03-31');

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'dateEndChange', newDate);

      expect(emittedFilters[0].end).toEqual(newDate);
    });
  });

  describe('filterByDateBetween', () => {
    it('should set today dates for TODAY type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'filterByDateBetween', BeetwenType.TODAY);

      const today = new Date();
      expect(emittedFilters[0].start?.toDateString()).toBe(
        today.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should set current week dates for CURR_WEEK type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(
        component,
        'filterByDateBetween',
        BeetwenType.CURR_WEEK,
      );

      const today = new Date();
      expect(emittedFilters[0].start).toBeInstanceOf(Date);
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should set last 7 days for LAST_7DAYS type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(
        component,
        'filterByDateBetween',
        BeetwenType.LAST_7DAYS,
      );

      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      expect(emittedFilters[0].start?.toDateString()).toBe(
        sevenDaysAgo.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should set current month dates for CURR_MONTH type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(
        component,
        'filterByDateBetween',
        BeetwenType.CURR_MONTH,
      );

      const today = new Date();
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);

      expect(emittedFilters[0].start?.toDateString()).toBe(
        firstOfMonth.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should set last month dates for LAST_MONTH type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(
        component,
        'filterByDateBetween',
        BeetwenType.LAST_MONTH,
      );

      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      expect(emittedFilters[0].start?.toDateString()).toBe(
        lastMonth.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should set today dates for CUSTOM type', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'filterByDateBetween', BeetwenType.CUSTOM);

      const today = new Date();
      expect(emittedFilters[0].start?.toDateString()).toBe(
        today.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });

    it('should handle unknown type with default dates', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push(filter);
      });

      callProtectedMethod(component, 'filterByDateBetween', 999);

      const today = new Date();
      expect(emittedFilters[0].start?.toDateString()).toBe(
        today.toDateString(),
      );
      expect(emittedFilters[0].end?.toDateString()).toBe(today.toDateString());
    });
  });

  describe('BeetwenType enum', () => {
    it('should have correct enum values', () => {
      expect(BeetwenType.TODAY).toBe(1);
      expect(BeetwenType.CURR_WEEK).toBe(2);
      expect(BeetwenType.LAST_7DAYS).toBe(3);
      expect(BeetwenType.CURR_MONTH).toBe(4);
      expect(BeetwenType.LAST_MONTH).toBe(5);
      expect(BeetwenType.CUSTOM).toBe(6);
    });

    it('should expose beetwenType in component', () => {
      fixture.detectChanges();

      const beetwenType = getPrivateProp<typeof BeetwenType>(
        component,
        'beetwenType',
      );
      expect(beetwenType).toBe(BeetwenType);
    });
  });

  describe('edge cases', () => {
    it('should handle empty labels array', () => {
      fixture.componentRef.setInput('labels', []);
      fixture.detectChanges();

      expect(component.labels()).toEqual([]);
    });

    it('should handle empty actuals array', () => {
      fixture.componentRef.setInput('actuals', []);
      fixture.detectChanges();

      expect(component.actuals()).toEqual([]);
    });

    it('should handle null filter gracefully', () => {
      fixture.componentRef.setInput('filter', null);
      fixture.detectChanges();

      // Component should not throw
      expect(component).toBeTruthy();
    });

    it('should handle partial filter input', () => {
      const partialFilter: Partial<IPaymentDocumentFilter> = {
        label_id: [1],
      };

      fixture.componentRef.setInput('filter', partialFilter);
      fixture.detectChanges();

      expect(component.filter()).toEqual(partialFilter);
    });

    it('should handle multiple filter updates in sequence', () => {
      fixture.detectChanges();
      const emittedFilters: Partial<IPaymentDocumentFilter>[] = [];

      component.filterEvent.subscribe((filter) => {
        emittedFilters.push({ ...filter });
      });

      callProtectedMethod(component, 'onLabelIDChanged', [mockLabels[0]]);
      callProtectedMethod(component, 'onBankDetailIDChanged', [mockActuals[0]]);
      callProtectedMethod(component, 'dateStartChange', new Date('2024-01-01'));

      expect(emittedFilters.length).toBe(3);
      expect(emittedFilters[2].label_id).toEqual([1]);
      expect(emittedFilters[2].bank_detail_id).toEqual([1]);
    });
  });
});
