import { provideZonelessChangeDetection } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CheckNumEditor, CheckNumEditorParams } from './check-num.component';

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

describe('CheckNumEditor', () => {
  let fixture: ComponentFixture<CheckNumEditor>;

  const createEditor = (params: CheckNumEditorParams): CheckNumEditor => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    const editorFixture = TestBed.createComponent(CheckNumEditor);
    fixture = editorFixture;
    const component = editorFixture.componentInstance;
    component.agInit(params);
    editorFixture.detectChanges();
    return component;
  };

  const typeValue = async (value: string): Promise<void> => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  };

  it('passes the typed number to lookupNumber and prepends a leading space on success', async () => {
    const lookupNumber = jest.fn(() => of(true));
    const component = createEditor({
      value: '',
      lookupNumber,
    } as unknown as CheckNumEditorParams);

    await typeValue('REQ-42');

    expect(lookupNumber).toHaveBeenCalledWith('REQ-42');
    await waitFor(() => expect(component.getValue()).toBe(' REQ-42'));
  });

  it('returns the number without surrounding spaces when the lookup fails', async () => {
    const lookupNumber = jest.fn(() => throwError(() => new Error('not found')));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const component = createEditor({
      value: '',
      lookupNumber,
    } as unknown as CheckNumEditorParams);

    await typeValue('  REQ-7  ');

    await waitFor(() => {
      expect(component.getValue()).toBe('REQ-7');
      expect(component.getValue()).toBe(component.getValue().trim());
    });
    expect(consoleError).toHaveBeenCalled();
  });

  it('returns the current value through getValue', () => {
    const component = createEditor({
      value: 'REQ-1',
      lookupNumber: () => of(true),
    } as unknown as CheckNumEditorParams);

    expect(component.getValue()).toBe('REQ-1');
  });

  it('skips the lookup for an empty value', async () => {
    const lookupNumber = jest.fn(() => of(true));
    createEditor({
      value: '',
      lookupNumber,
    } as unknown as CheckNumEditorParams);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(lookupNumber).not.toHaveBeenCalled();
  });
});
