import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { GridApi, IStatusPanelParams } from 'ag-grid-community';
import {
  AllCommunityModule,
  createGrid,
  ModuleRegistry,
} from 'ag-grid-community';

import type { MoneySumStatusPanelParams } from './money-sum-status-bar.component';
import { MoneySumStatusBarComponent } from './money-sum-status-bar.component';

interface Row {
  amount: number;
}

const total = (rows: Row[]): number =>
  rows.reduce((acc, { amount }) => acc + amount, 0);

describe('MoneySumStatusBarComponent', () => {
  let fixture: ComponentFixture<MoneySumStatusBarComponent<Row>>;
  let api: GridApi<Row>;

  beforeAll(() => {
    registerLocaleData(localeRu, 'ru');
    ModuleRegistry.registerModules([AllCommunityModule]);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneySumStatusBarComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(
      MoneySumStatusBarComponent,
    ) as ComponentFixture<MoneySumStatusBarComponent<Row>>;
  });

  afterEach(() => api?.destroy());

  const createApi = (rowData: Row[]): GridApi<Row> =>
    createGrid<Row>(document.createElement('div'), {
      columnDefs: [{ field: 'amount', filter: 'agNumberColumnFilter' }],
      rowData,
    });

  const init = (
    params: Partial<MoneySumStatusPanelParams<Row>> & { rows?: Row[] } = {},
  ): void => {
    api = createApi(params.rows ?? []);
    fixture.componentInstance.agInit({
      api,
      label: 'ИТОГО',
      sum: total,
      ...params,
    } as unknown as IStatusPanelParams<Row> & MoneySumStatusPanelParams<Row>);
    fixture.detectChanges();
  };

  const settle = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    fixture.detectChanges();
  };

  const text = (): string =>
    (fixture.nativeElement as HTMLElement).textContent
      ?.replace(/\s+/g, ' ')
      .trim() ?? '';

  const valueEl = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector(
      '.ag-name-value-value',
    ) as HTMLElement;

  describe('sum rule', () => {
    it('shows the label and the result of the supplied sum', () => {
      const invoicesMinusPayments = (rows: Row[]): number =>
        rows.reduce(
          (acc, { amount }, i) => (i === 0 ? acc - amount : acc + amount),
          0,
        );

      init({
        rows: [{ amount: 1000 }, { amount: 300 }],
        sum: invoicesMinusPayments,
      });

      expect(text()).toBe('ИТОГО: -700,00');
    });

    it('passes only displayed rows to sum after a filter', async () => {
      const sum = jest.fn(total);
      init({ rows: [{ amount: 100 }, { amount: 200 }], sum });

      await api.setColumnFilterModel('amount', {
        filterType: 'number',
        type: 'lessThan',
        filter: 150,
      });
      api.onFilterChanged();
      await settle();

      expect(sum).toHaveBeenLastCalledWith([{ amount: 100 }]);
      expect(text()).toBe('ИТОГО: 100,00');
    });

    it('recalculates when row data is replaced', async () => {
      init({ rows: [{ amount: 100 }] });

      api.setGridOption('rowData', [{ amount: 40 }, { amount: 2 }]);
      await settle();

      expect(text()).toBe('ИТОГО: 42,00');
    });

    it('shows zero for an empty table', () => {
      init({ rows: [] });

      expect(text()).toBe('ИТОГО: 0,00');
    });

    it('stops recalculating after destroy', async () => {
      const sum = jest.fn(total);
      init({ rows: [{ amount: 1 }], sum });
      const calls = sum.mock.calls.length;

      fixture.destroy();
      api.setGridOption('rowData', [{ amount: 5 }]);
      // Без settle(): у уничтоженного fixture нельзя вызывать detectChanges.
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(sum).toHaveBeenCalledTimes(calls);
    });
  });

  describe('format', () => {
    it('uses exactly two decimals by default', () => {
      init({ rows: [{ amount: 1234567.5 }] });

      expect(text()).toBe('ИТОГО: 1 234 567,50');
    });

    it('applies the supplied digits format', () => {
      init({ rows: [{ amount: 1000 }], digitsInfo: '1.0-2' });

      expect(text()).toBe('ИТОГО: 1 000');
    });
  });

  describe('sign colouring', () => {
    it('does not colour the value by default', () => {
      init({ rows: [{ amount: -5 }] });

      expect(valueEl().className).not.toMatch(/money-sum--/);
    });

    it.each([
      [-5, 'money-sum--negative'],
      [5, 'money-sum--positive'],
      [0, 'money-sum--zero'],
    ])('colours %p as %s when enabled', (amount, cssClass) => {
      init({ rows: [{ amount }], colorBySign: true });

      expect(valueEl().classList).toContain(cssClass);
    });
  });
});
