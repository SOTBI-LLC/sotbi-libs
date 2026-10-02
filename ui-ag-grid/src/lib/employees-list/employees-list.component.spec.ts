import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import type { Employee, itemMapPair } from '@sotbi/models';
import { ContourType } from '@sotbi/models';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { of } from 'rxjs';
import { EmployeesListComponent } from './employees-list.component';

const makeWorker = (worker: Partial<Employee>): FormGroup =>
  new FormGroup({
    id: new FormControl<number | null>(worker.id ?? 0, Validators.required),
    position: new FormControl<string | null>(worker.position ?? null, Validators.required),
    position_type: new FormControl<string>(worker.position_type ?? 'Основное', {
      nonNullable: true,
      validators: Validators.required,
    }),
    contour_type: new FormControl<string>(worker.contour_type ?? 'Внутренний', {
      nonNullable: true,
      validators: Validators.required,
    }),
    start: new FormControl<Date | null>(worker.start ?? new Date(), Validators.required),
    stop: new FormControl<Date | null>(worker.stop ?? null),
    user_id: new FormControl<number | null>(worker.user_id ?? null),
    user_name: new FormControl<string | null>(worker.user_name ?? null),
    is_work_now: new FormControl<boolean | null>(worker.is_work_now ?? true),
  });

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

describe('EmployeesListComponent', () => {
  beforeEach(() => {
    registerLocaleData(ru);
    ModuleRegistry.registerModules([AllEnterpriseModule]);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    document.body.querySelectorAll('.ng-dropdown-panel').forEach((panel) => panel.remove());
  });

  const createComponent = (
    form: FormArray,
    inputs: Record<string, unknown> = {},
  ): ReturnType<typeof TestBed.createComponent<EmployeesListComponent>> => {
    const fixture = TestBed.createComponent(EmployeesListComponent);
    fixture.componentRef.setInput('employeesList', form);
    fixture.componentRef.setInput('isEdit', true);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    return fixture;
  };

  const getGrid = (
    fixture: ReturnType<typeof TestBed.createComponent<EmployeesListComponent>>,
  ): AgGridAngular => fixture.debugElement.query(By.directive(AgGridAngular)).componentInstance;

  const selectUserThroughUi = async (
    fixture: ReturnType<typeof TestBed.createComponent<EmployeesListComponent>>,
  ): Promise<void> => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    const gridApi = getGrid(fixture).api!;
    const userColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().headerName === 'Пользователь')!;
    gridApi.startEditingCell({ rowIndex: 0, colKey: userColumn });
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('ng-select input');
    input.dispatchEvent(new Event('focus'));
    input.value = 'ivan';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    await waitFor(() =>
      expect(document.querySelectorAll('.ng-dropdown-panel .ng-option').length).toBeGreaterThan(0),
    );
    const option = document.querySelector<HTMLElement>('.ng-dropdown-panel .ng-option')!;
    expect(option.textContent).toContain('ivan.petrov');
    option.click();
    await fixture.whenStable();
  };

  it('selects a user with lookupUserName and syncs user_id and the full name', async () => {
    const form = new FormArray([
      makeWorker({ id: 1, contour_type: ContourType.Internal, user_id: null, user_name: null }),
    ]);
    const fixture = createComponent(form, {
      users: [{ id: 42, user: 'ivan.petrov', avatar: '' }],
      usersMap: new Map([[42, ['ivan.petrov', '']]]) as itemMapPair<string>,
      lookupUserName: (id: number) => (id === 42 ? of('Иван Петров') : of('')),
    });
    await selectUserThroughUi(fixture);

    await waitFor(() =>
      expect(form.at(0).value).toMatchObject({ user_id: 42, user_name: 'Иван Петров' }),
    );
    expect(form.dirty).toBe(true);
    expect(
      (fixture.nativeElement.querySelector('[col-id="user_name"].ag-cell') as HTMLElement)
        .textContent,
    ).toContain('Иван Петров');
  });

  it('keeps the supplied user_name when no lookupUserName is provided', async () => {
    const form = new FormArray([
      makeWorker({
        id: 1,
        contour_type: ContourType.Internal,
        user_id: null,
        user_name: 'Пётр Сидоров',
      }),
    ]);
    const fixture = createComponent(form, {
      users: [{ id: 42, user: 'ivan.petrov', avatar: '' }],
      usersMap: new Map([[42, ['ivan.petrov', '']]]) as itemMapPair<string>,
    });
    await selectUserThroughUi(fixture);
    await fixture.whenStable();

    expect(form.at(0).value.user_id).toBe(42);
    expect(form.at(0).value.user_name).toBe('Пётр Сидоров');
  });

  it('renders usersMap captions by user_id', async () => {
    const form = new FormArray([
      makeWorker({
        id: 1,
        contour_type: ContourType.Internal,
        user_id: 42,
        user_name: 'Иван Петров',
      }),
    ]);
    const fixture = createComponent(form, {
      users: [{ id: 42, user: 'ivan.petrov', avatar: 'avatar.png' }],
      usersMap: new Map([[42, ['ivan.petrov', 'avatar.png']]]) as itemMapPair<string>,
    });
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        (fixture.nativeElement.querySelector('[col-id="user_id"].ag-cell') as HTMLElement)
          .textContent,
      ).toContain('ivan.petrov'),
    );
  });

  it('allows deleting the first row', async () => {
    const form = new FormArray([makeWorker({ id: 1 }), makeWorker({ id: 2 })]);
    const fixture = createComponent(form);
    await fixture.whenStable();
    await waitFor(() =>
      expect(
        fixture.nativeElement.querySelectorAll('button[aria-label="Удалить"]').length,
      ).toBe(2),
    );
    (
      fixture.nativeElement.querySelector('button[aria-label="Удалить"]') as HTMLButtonElement
    ).click();
    await fixture.whenStable();

    expect(form.length).toBe(1);
  });

  it('resets related fields when the contour type changes', async () => {
    const form = new FormArray([
      makeWorker({
        id: 1,
        contour_type: ContourType.Internal,
        user_id: 42,
        user_name: 'Иван Петров',
      }),
    ]);
    const fixture = createComponent(form);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    const gridApi = getGrid(fixture).api!;
    const contourColumn = gridApi
      .getColumns()!
      .find((column) => column.getColDef().headerName === 'Контур')!;
    // picker-поповер грида не рендерится в jsdom; valueSetter прогоняется публичным API строки
    gridApi.getRenderedNodes()[0]?.setDataValue(contourColumn, 'Внешний');
    await fixture.whenStable();
    await waitFor(() =>
      expect(form.at(0).value).toMatchObject({ user_id: null, user_name: null }),
    );
  });
});
