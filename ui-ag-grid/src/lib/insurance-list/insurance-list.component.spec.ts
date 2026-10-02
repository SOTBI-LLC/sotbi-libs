import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import type { Bankruptcy, InsuranceCompany } from '@sotbi/models';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { Subject } from 'rxjs';
import { InsuranceListComponent } from './insurance-list.component';

const policy = {
  id: 1,
  status: true,
  bankruptcy_manager_id: 5,
  debtor: { id: 77, name: 'ООО Должник' },
  insurance_company_id: 9,
  sum_insured: 1000,
  insurance_premium: 100,
  from: '2026-01-01',
  to: '2026-12-31',
};

describe('InsuranceListComponent', () => {
  beforeEach(() => {
    registerLocaleData(ru);
    ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  const createComponent = (
    inputs: Record<string, unknown> = {},
  ): ReturnType<typeof TestBed.createComponent<InsuranceListComponent>> => {
    const fixture = TestBed.createComponent(InsuranceListComponent);
    fixture.componentRef.setInput('insuranceList', [policy]);
    fixture.componentRef.setInput('bankruptcies', [
      { id: 5, show: 'Иванов И.И.' },
    ] as unknown as Bankruptcy[]);
    fixture.componentRef.setInput('insuranceCompanies', [
      { id: 9, name: 'Страховая А' },
    ] as unknown as InsuranceCompany[]);
    fixture.componentRef.setInput('downloadAll', () => new Subject());
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    return fixture;
  };

  const getGrid = (
    fixture: ReturnType<typeof TestBed.createComponent<InsuranceListComponent>>,
  ): AgGridAngular => fixture.debugElement.query(By.directive(AgGridAngular)).componentInstance;

  /** Устойчивое ожидание результата через UI без обращения к приватным методам компонента. */
  async function waitFor(assertion: () => void, timeoutMs = 5000): Promise<void> {
    const startedAt = Date.now();
    for (;;) {
      try {
        assertion();
        return;
      } catch (error) {
        if (Date.now() - startedAt > timeoutMs) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }

  it('displays captions from the supplied catalogs', async () => {
    const fixture = createComponent();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.ag-row').length,
      ).toBeGreaterThan(0),
    );
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Иванов И.И.');
    expect(text).toContain('Страховая А');
    expect(text).toContain('ООО Должник');
  });

  it('emits openInsurance with the row id on double click', async () => {
    const fixture = createComponent();
    const opened: number[] = [];
    fixture.componentInstance.openInsurance.subscribe((id) => opened.push(id));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.ag-row').length,
      ).toBeGreaterThan(0),
    );
    const row = (fixture.nativeElement as HTMLElement).querySelector('.ag-row') as HTMLElement;
    const cell = row.querySelector('.ag-cell') as HTMLElement;
    cell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(opened).toEqual([1]);
  });

  it('keeps the default debtor and company links', async () => {
    const fixture = createComponent();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.ag-row').length,
      ).toBeGreaterThan(0),
    );
    const gridApi = getGrid(fixture).api!;
    const debtorColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().field === 'debtor.name')!;
    const companyColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().field === 'insurance_company_id')!;
    const rowNode = gridApi.getRenderedNodes()[0];

    const debtorParams = debtorColumn.getColDef().cellRendererParams!(rowNode!);
    expect(debtorParams.linkTo).toEqual(['/bankruptcy', 'debtors', 77, 'common']);

    const companyParams = companyColumn.getColDef().cellRendererParams!(rowNode!);
    expect(companyParams.linkTo).toEqual(['/catalogs', 'insurance-companies', 9]);
  });

  it('uses consumer-supplied link builders when provided', async () => {
    const fixture = createComponent({
      debtorLink: (id: number) => ['/custom', 'debtor', id],
      insuranceCompanyLink: (id: number) => ['/custom', 'company', id],
    });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (fixture.nativeElement as HTMLElement).querySelectorAll('.ag-row').length,
      ).toBeGreaterThan(0),
    );
    const gridApi = getGrid(fixture).api!;
    const debtorColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().field === 'debtor.name')!;
    const companyColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().field === 'insurance_company_id')!;
    const rowNode = gridApi.getRenderedNodes()[0];

    expect(debtorColumn.getColDef().cellRendererParams!(rowNode!).linkTo).toEqual([
      '/custom',
      'debtor',
      77,
    ]);
    expect(companyColumn.getColDef().cellRendererParams!(rowNode!).linkTo).toEqual([
      '/custom',
      'company',
      9,
    ]);
  });

  it('persists grid state with the insurance-list storage prefix', async () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    const getItem = jest.spyOn(Storage.prototype, 'getItem');
    const fixture = createComponent({ all: true });
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();

    // восстановление состояния читает хранилище с префиксом insurance-list
    expect(getItem.mock.calls.some(([key]) => String(key).startsWith('insurance-list-'))).toBe(
      true,
    );
    // событие колонки записывает состояние в то же хранилище
    getGrid(fixture).api!.setColumnsVisible(['sum_insured'], false);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(setItem.mock.calls.some(([key]) => String(key).startsWith('insurance-list-'))).toBe(
      true,
    );
  });
});
