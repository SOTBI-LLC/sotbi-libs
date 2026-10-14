import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SIDE_PANEL_DATA } from './side-panel-config';
import { SidePanelRef } from './side-panel-ref';
import { SidePanelFrameComponent } from './side-panel-frame';
import { SidePanelService } from './side-panel.service';

@Component({
  imports: [SidePanelFrameComponent],
  template: `<sotbi-side-panel
    ><h3 panelTitle>Проверка</h3>
    <div panelBody>{{ data }}</div>
    <div panelActions><button (click)="ref.complete(data)">Готово</button></div>
  </sotbi-side-panel>`,
})
class ExamplePanel {
  public readonly data = inject(SIDE_PANEL_DATA);
  public readonly ref = inject(SidePanelRef);
}

describe('Programmatic panel opening', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] }),
  );
  it('provides data and disposes the view after returning its result', async () => {
    const service = TestBed.inject(SidePanelService);
    const panel = service.open<ExamplePanel, string, string>(ExamplePanel, {
      data: 'Результат',
      size: 'lg',
    });
    await TestBed.inject(ApplicationRef).whenStable();
    const results: unknown[] = [];
    panel.closed.subscribe((result) => results.push(result));
    expect(document.body.textContent).toContain('Результат');
    Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === 'Готово')!
      .click();
    expect(results).toEqual([{ kind: 'success', value: 'Результат' }]);
    expect(document.querySelector('sotbi-side-panel')).toBeNull();
  });
});

it('returns focus to a visible action if the original trigger disappears', async () => {
  TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
  const trigger = document.createElement('button');
  const fallback = document.createElement('button');
  fallback.textContent = 'Открыть другой проект';
  document.body.append(trigger, fallback);
  // Browser layout is a system boundary; jsdom does not calculate rectangles.
  stubVisibleLayout(fallback);
  trigger.focus();
  const panel = TestBed.inject(SidePanelService).open(ExamplePanel, {
    data: 'Проект',
  });
  await TestBed.inject(ApplicationRef).whenStable();
  trigger.remove();
  panel.complete('Проект');
  expect(document.activeElement).toBe(fallback);
  fallback.remove();
});

function stubVisibleLayout(element: HTMLElement): void {
  jest
    .spyOn(element, 'getClientRects')
    .mockReturnValue([new DOMRect(0, 0, 20, 20)] as unknown as DOMRectList);
}
