import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { NgSelectComponent } from '@ng-select/ng-select';
import type { IFilterParams } from 'ag-grid-community';
import { of, throwError } from 'rxjs';
import { AgGridFilterType } from '../ag-grid.common';
import type {
  TradingCodeFilterParams} from './trading-code-filter.component';
import {
  TradingCodeFilterComponent
} from './trading-code-filter.component';

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

describe('TradingCodeFilterComponent', () => {
  let fixture: ComponentFixture<TradingCodeFilterComponent>;

  afterEach(() => {
    // ng-select рендерит панель в document.body — убираем её между тестами
    document.body.querySelectorAll('.ng-dropdown-panel').forEach((panel) => panel.remove());
  });

  const createFilter = (params: Partial<TradingCodeFilterParams>): TradingCodeFilterComponent => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const filterFixture = TestBed.createComponent(TradingCodeFilterComponent);
    fixture = filterFixture;
    const component = filterFixture.componentInstance;
    component.agInit({
      filterChangedCallback: () => undefined,
      ...params,
    } as IFilterParams as TradingCodeFilterParams);
    filterFixture.detectChanges();
    return component;
  };

  /** ng-select рендерит панель вариантов в document.body (appendTo). */
  const openDropdown = (): void => {
    const ngSelect = fixture.debugElement
      .query(By.css('ng-select'))
      .injector.get(NgSelectComponent);
    ngSelect.open();
  };

  const typeTerm = async (term: string): Promise<void> => {
    openDropdown();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = term;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  };

  it('searches options through the supplied searchTradingCodes callback', async () => {
    const searchTradingCodes = jest.fn(() =>
      of([
        { id: 1, name: 'АБС' },
        { id: 2, name: 'ТТС' },
      ]),
    );
    createFilter({ searchTradingCodes });

    await typeTerm('аб');

    expect(searchTradingCodes).toHaveBeenCalledWith('аб');
    await waitFor(() =>
      expect(document.body.querySelectorAll('.ng-option').length).toBe(2),
    );
  });

  it('applies the selected value through the public filter model', async () => {
    const searchTradingCodes = jest.fn(() => of([{ id: 7, name: 'АБС' }]));
    const component = createFilter({ searchTradingCodes });

    await typeTerm('аб');
    await waitFor(() => expect(document.body.querySelectorAll('.ng-option').length).toBe(1));
    (document.body.querySelector('.ng-option') as HTMLElement).click();
    await fixture.whenStable();

    expect(component.isFilterActive()).toBe(true);
    expect(component.doesFilterPass()).toBe(true);
    expect(component.getModel()).toEqual({ values: ['7'], filterType: AgGridFilterType.SET });
  });

  it('restores the model with setModel and reports inactive without values', () => {
    const component = createFilter({
      searchTradingCodes: () => of([]),
    });

    component.setModel({ values: ['3', '4'], filterType: AgGridFilterType.SET });
    expect(component.isFilterActive()).toBe(true);
    expect(component.getModel()).toEqual({
      values: ['3', '4'],
      filterType: AgGridFilterType.SET,
    });

    component.setModel(null);
    expect(component.isFilterActive()).toBe(false);
    expect(component.getModel()).toBeNull();
  });

  it('shows no options and stays available when the search fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const searchTradingCodes = jest.fn(() => throwError(() => new Error('boom')));
    createFilter({ searchTradingCodes });

    await typeTerm('аб');
    await fixture.whenStable();

    // варианты отсутствуют — панель показывает «Не найдено», компонент остаётся доступным
    expect(document.body.querySelectorAll('.ng-dropdown-panel').length).toBe(1);
    expect(document.body.querySelector('.ng-dropdown-panel')!.textContent).toContain(
      'Не найдено',
    );
    expect(fixture.componentInstance.isFilterActive()).toBe(false);
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
