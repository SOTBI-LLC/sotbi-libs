import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { EMPTY, of, Subject } from 'rxjs';
import { RealEstateListComponent } from './real-estate-list.component';
import type { RealEstateForm } from '../real-estate-form';

const createRow = (id: number | null, requestNum = ''): FormGroup<RealEstateForm> =>
  new FormGroup<RealEstateForm>({
    id: new FormControl(id),
    cadastral_no: new FormControl('12:34:567890:1', { nonNullable: true }),
    parameters: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    request_num: new FormControl(requestNum, { nonNullable: true }),
    key: new FormControl('', { nonNullable: true }),
    file: new FormControl('', { nonNullable: true }),
    original_file_name: new FormControl('', { nonNullable: true }),
  });

describe('RealEstateListComponent', () => {
  beforeEach(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  const createComponent = (form: FormArray<FormGroup<RealEstateForm>>) => {
    const fixture = TestBed.createComponent(RealEstateListComponent);
    fixture.componentRef.setInput('realEstate', form);
    fixture.componentRef.setInput('edit', true);
    fixture.componentRef.setInput('showFile', true);
    fixture.componentRef.setInput('uploadFiles', () => new Subject());
    fixture.componentRef.setInput('downloadFile', () => new Subject());
    fixture.componentRef.setInput('lookupNumber', () => EMPTY);
    return fixture;
  };

  const getGrid = (fixture: ReturnType<typeof createComponent>): AgGridAngular =>
    fixture.debugElement.query(By.directive(AgGridAngular)).componentInstance;

  it('checks an entered request number using the input and highlights an existing number', async () => {
    const form = new FormArray([createRow(1)]);
    const fixture = createComponent(form);
    fixture.componentRef.setInput('lookupNumber', (num: string) =>
      num === 'REQ-42' ? of({ id: 42 }) : EMPTY,
    );
    await fixture.whenStable();
    const grid = getGrid(fixture);
    grid.api.startEditingCell({ rowIndex: 0, colKey: 'request_num' });
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#checkNum');
    expect(input).toBeTruthy();
    input.value = 'REQ-42';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    grid.api.stopEditing();
    await fixture.whenStable();

    expect(form.at(0).value.request_num).toBe(' REQ-42');
    expect(
      fixture.nativeElement.querySelector('[col-id="request_num"].ag-cell').style.background,
    ).toBe('rgb(245, 219, 217)');
  });

  it('patches the passed form array when a cell value changes', async () => {
    const form = new FormArray([createRow(1)]);
    const fixture = createComponent(form);
    await fixture.whenStable();
    const grid = getGrid(fixture);
    grid.api.startEditingCell({ rowIndex: 0, colKey: 'parameters' });
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector(
      'input.ag-input-field-input',
    ) as HTMLInputElement;
    input.value = 'Новые параметры';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    grid.api.stopEditing();
    await fixture.whenStable();

    expect(form.at(0).value.parameters).toBe('Новые параметры');
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

  it('deletes a saved row through the UI and emits its index and id', async () => {
    const form = new FormArray([createRow(1), createRow(2), createRow(null)]);
    const fixture = createComponent(form);
    const deleted: { idx: number; id: number }[] = [];
    fixture.componentInstance.delete.subscribe((value) => deleted.push(value));
    await fixture.whenStable();

    await waitFor(() =>
      expect(fixture.nativeElement.querySelectorAll('svg.is-error').length).toBe(3),
    );
    const deleteButtons = fixture.nativeElement.querySelectorAll('svg.is-error');
    (deleteButtons[0] as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(deleted).toEqual([{ idx: 0, id: 1 }]);
    expect(form.length).toBe(2);
  });

  it('removes a new row without an id silently', async () => {
    const form = new FormArray([createRow(1), createRow(null)]);
    const fixture = createComponent(form);
    const deleted: { idx: number; id: number }[] = [];
    fixture.componentInstance.delete.subscribe((value) => deleted.push(value));
    await fixture.whenStable();

    await waitFor(() =>
      expect(fixture.nativeElement.querySelectorAll('svg.is-error').length).toBe(2),
    );
    const deleteButtons = fixture.nativeElement.querySelectorAll('svg.is-error');
    (deleteButtons[1] as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(deleted).toEqual([]);
    expect(form.length).toBe(1);
  });
});
