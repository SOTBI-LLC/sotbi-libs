import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { SimpleEditModel } from '@sotbi/models';
import { of, throwError } from 'rxjs';
import type {
  TradingCodeEditorParams} from './select-search-trading-code-editor.component';
import {
  SelectSearchTradingCodeEditor
} from './select-search-trading-code-editor.component';

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

describe('SelectSearchTradingCodeEditor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  afterEach(() => {
    // ng-select рендерит панель в document.body — убираем её между тестами
    document.body.querySelectorAll('.ng-dropdown-panel').forEach((panel) => panel.remove());
  });

  it('lets the user select a trading code returned by the supplied search', async () => {
    const stopEditing = jest.fn();
    const fixture = TestBed.createComponent(SelectSearchTradingCodeEditor);
    const params = {
      value: null,
      data: {},
      api: { stopEditing },
      searchTradingCodes: (term: string) =>
        of<SimpleEditModel[]>(term === 'ТОРГ' ? [{ id: 42, name: 'ТОРГ-42' }] : []),
    } as unknown as TradingCodeEditorParams;
    fixture.componentInstance.agInit(params);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'ТОРГ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    await waitFor(() =>
      expect(document.querySelectorAll('.ng-dropdown-panel .ng-option').length).toBe(1),
    );

    const option = document.querySelector<HTMLElement>('.ng-dropdown-panel .ng-option')!;
    expect(option.textContent).toContain('ТОРГ-42');
    option.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.getValue()).toBe(42);
    expect(stopEditing).toHaveBeenCalled();
  });

  it('keeps the preselected value through getValue', () => {
    const fixture = TestBed.createComponent(SelectSearchTradingCodeEditor);
    const params = {
      value: 11,
      data: { trading_code: { id: 11, name: 'ТОРГ-11' } },
      api: { stopEditing: () => undefined },
      searchTradingCodes: () => of<SimpleEditModel[]>([]),
    } as unknown as TradingCodeEditorParams;
    fixture.componentInstance.agInit(params);
    fixture.detectChanges();

    expect(fixture.componentInstance.getValue()).toBe(11);
  });

  it('shows empty variants and stays available when the search fails', async () => {
    const fixture = TestBed.createComponent(SelectSearchTradingCodeEditor);
    const params = {
      value: null,
      data: {},
      api: { stopEditing: () => undefined },
      searchTradingCodes: () => throwError(() => new Error('boom')),
    } as unknown as TradingCodeEditorParams;
    fixture.componentInstance.agInit(params);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'ТОРГ';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    // пустой результат поиска отображается как «Не найдено» без падения компонента
    await waitFor(() =>
      expect(document.querySelector('.ng-dropdown-panel')!.textContent).toContain('Не найдено'),
    );
    expect(fixture.componentInstance.getValue()).toBeNull();
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });
});
