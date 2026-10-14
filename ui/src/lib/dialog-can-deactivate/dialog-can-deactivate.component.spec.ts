import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SidePanelService } from '../side-panel/side-panel.service';
import {
  DialogCanDeactivateComponent,
  DialogCanDeactivateActionType,
} from './dialog-can-deactivate.component';

const choose = (label: string): void => {
  const button = Array.from(
    document.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => element.textContent?.trim().endsWith(label));
  expect(button).toBeDefined();
  button?.click();
};

describe('Unsaved page confirmation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] }),
  );

  it.each([
    ['Сохранить', DialogCanDeactivateActionType.SAVE],
    ['Не сохранять', DialogCanDeactivateActionType.CANCEL],
  ])('returns the explicit decision: %s', async (label, action) => {
    const panel = TestBed.inject(SidePanelService).open(
      DialogCanDeactivateComponent,
      { data: { canBeSaved: true } },
    );
    const results: unknown[] = [];
    panel.afterClosed().subscribe((result) => results.push(result));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(document.querySelector('clr-side-panel')).toBeNull();
    choose(label);
    expect(results).toEqual([{ res: true, action }]);
  });

  it('keeps the page when the user chooses to continue editing', async () => {
    const panel = TestBed.inject(SidePanelService).open(
      DialogCanDeactivateComponent,
      { data: { canBeSaved: false } },
    );
    const results: unknown[] = [];
    panel.afterClosed().subscribe((result) => results.push(result));
    await TestBed.inject(ApplicationRef).whenStable();
    choose('Продолжить редактирование');
    expect(results).toEqual([{ res: false }]);
  });
});
