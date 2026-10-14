import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SidePanelFrameComponent } from './side-panel-frame';

@Component({
  imports: [SidePanelFrameComponent],
  template: `<sotbi-side-panel
    #panel
    [dirty]="true"
    (cancelled)="cancelled = true"
  >
    <h3 panelTitle>Изменить запись</h3>
    <div panelBody><input aria-label="Название" required value="" /></div>
    <button panelActions (click)="panel.requestClose()">Отмена</button>
  </sotbi-side-panel>`,
})
class DraftForm {
  public cancelled = false;
}

describe('Side panel interaction', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }),
  );
  it('returns focus to an available action when a declarative panel trigger disappears', async () => {
    const trigger = document.createElement('button');
    const fallback = document.createElement('button');
    document.body.append(trigger, fallback);
    jest
      .spyOn(fallback, 'getClientRects')
      .mockReturnValue([new DOMRect(0, 0, 20, 20)] as unknown as DOMRectList);
    trigger.focus();
    const fixture = TestBed.createComponent(DraftForm);
    fixture.detectChanges();
    await fixture.whenStable();
    trigger.remove();
    fixture.destroy();
    await Promise.resolve();
    expect(document.activeElement).toBe(fallback);
    fallback.remove();
  });
  it('keeps the panel open when a nested control consumes Escape', async () => {
    const fixture = TestBed.createComponent(DraftForm);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = document.querySelector<HTMLInputElement>('input')!;
    input.addEventListener('keydown', (event) => event.preventDefault());
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', bubbles: true, cancelable: true,
    }));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.body.textContent).not.toContain('Закрыть без сохранения?');
    expect(fixture.componentInstance.cancelled).toBe(false);
  });
  it.each(['cross', 'cancel', 'escape'])(
    'protects an invalid draft on %s and keeps it after declining',
    async (entry) => {
      const fixture = TestBed.createComponent(DraftForm);
      fixture.detectChanges();
      await fixture.whenStable();
      document.querySelector<HTMLElement>('.modal-backdrop')!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.cancelled).toBe(false);
      expect(document.body.textContent).not.toContain(
        'Закрыть без сохранения?',
      );
      const close = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Закрыть"]',
      )!;
      if (entry === 'cross') close.click();
      else if (entry === 'cancel')
        Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
          .find((button) => button.textContent?.trim() === 'Отмена')!
          .click();
      else
        document.querySelector<HTMLInputElement>('input')!.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            bubbles: true,
          }),
        );
      fixture.detectChanges();
      await fixture.whenStable();
      if (entry === 'escape') {
        document.activeElement?.dispatchEvent(
          new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
        );
        fixture.detectChanges();
        await fixture.whenStable();
      }
      expect(document.body.textContent).toContain('Закрыть без сохранения?');
      const stay = Array.from(
        document.querySelectorAll<HTMLButtonElement>('button'),
      ).find(
        (button) => button.textContent?.trim() === 'Продолжить редактирование',
      )!;
      close.click();
      fixture.detectChanges();
      expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(2);
      if (entry === 'escape')
        stay.dispatchEvent(
          new KeyboardEvent('keyup', { key: 'Escape', bubbles: true }),
        );
      else stay.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.cancelled).toBe(false);
      expect(document.querySelector<HTMLInputElement>('input')!.value).toBe('');
    },
  );
});
