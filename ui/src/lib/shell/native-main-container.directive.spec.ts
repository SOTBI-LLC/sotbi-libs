import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NativeMainContainerDirective } from './native-main-container.directive';
import { NativeNavLevelDirective } from './native-nav-level.directive';

@Component({
  imports: [NativeMainContainerDirective, NativeNavLevelDirective],
  template: `
    <div libMainContainer>
      <button id="trigger">Open</button>
      <nav [libNavLevel]="1"><a class="nav-link" href="#one">One</a></nav>
      <nav [libNavLevel]="2">
        <a class="nav-link" href="#two">Two</a>
        <div libMainContainer>
          <button id="inner-trigger">Open inner</button>
          <nav [libNavLevel]="1">
            <a class="nav-link" href="#inner">Inner</a>
          </nav>
        </div>
      </nav>
    </div>
    <div libMainContainer>
      <nav [libNavLevel]="1"><a href="#other">Other shell</a></nav>
    </div>
  `,
})
class ShellHost {}

describe('native responsive shell', () => {
  const originalWidth = window.innerWidth;
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalWidth,
    });
  });
  async function create(width: number) {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: width,
    });
    const fixture = TestBed.createComponent(ShellHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const shells = fixture.debugElement.queryAll(
      By.directive(NativeMainContainerDirective),
    );
    const shell = shells[0].injector.get(NativeMainContainerDirective);
    const panels = Array.from(
      fixture.nativeElement.querySelectorAll('nav'),
    ) as HTMLElement[];
    const trigger = fixture.nativeElement.querySelector(
      '#trigger',
    ) as HTMLElement;
    return { fixture, shells, shell, panels, trigger };
  }

  it('registers panels per shell and opens only one mobile level at a time', async () => {
    const { fixture, shells, shell, panels, trigger } = await create(390);
    expect(shell.levels().size).toBe(2);
    expect(
      shells[1].injector.get(NativeMainContainerDirective).levels().size,
    ).toBe(1);
    expect(panels.every((p) => p.hidden)).toBe(true);
    shell.open(1, trigger);
    fixture.detectChanges();
    expect(panels[0].hidden).toBe(false);
    expect(panels[2].hidden).toBe(true);
    expect(
      shells[0].nativeElement.classList.contains('open-hamburger-menu'),
    ).toBe(true);
    shell.open(2, trigger);
    fixture.detectChanges();
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(
      shells[0].nativeElement.classList.contains('open-hamburger-menu'),
    ).toBe(false);
    fixture.destroy();
  });

  it('closes on Escape, native link and native close button without leaking keys', async () => {
    const { fixture, shell, panels, trigger } = await create(390);
    shell.open(1, trigger);
    panels[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(shell.openLevel()).toBeNull();
    shell.open(2, trigger);
    panels[1].querySelector('a')!.click();
    expect(shell.openLevel()).toBeNull();
    shell.open(2, trigger);
    const bubbled = jest.fn();
    panels[1].addEventListener('keydown', bubbled);
    panels[1]
      .querySelector('button')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
    expect(bubbled).not.toHaveBeenCalled();
    panels[1].querySelector('button')!.click();
    expect(shell.openLevel()).toBeNull();
    fixture.destroy();
  });

  it('keeps outer navigation open when a nested shell handles Escape or a link', async () => {
    const { fixture, shells, shell, panels, trigger } = await create(390);
    const inner = shells[1].injector.get(NativeMainContainerDirective);
    const innerTrigger = fixture.nativeElement.querySelector('#inner-trigger');
    shell.open(2, trigger);
    inner.open(1, innerTrigger);
    panels[2]
      .querySelector('a')!
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    expect(inner.openLevel()).toBeNull();
    expect(shell.openLevel()).toBe(2);
    inner.open(1, innerTrigger);
    panels[2].querySelector('a')!.click();
    expect(inner.openLevel()).toBeNull();
    expect(shell.openLevel()).toBe(2);
    fixture.destroy();
  });

  it('restores focus when resize closes a menu within mobile widths', async () => {
    const { fixture, shell, panels, trigger } = await create(390);
    shell.open(1, trigger);
    panels[0].querySelector('a')!.focus();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 400,
    });
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(shell.openLevel()).toBeNull();
    expect(panels[0].hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it('matches CSS at 992px and restores desktop visibility after resize', async () => {
    const { fixture, shell, panels, trigger } = await create(992);
    expect(shell.mobile()).toBe(true);
    shell.open(1, trigger);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 993,
    });
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect(shell.openLevel()).toBeNull();
    expect(shell.mobile()).toBe(false);
    expect(panels.every((p) => !p.hidden)).toBe(true);
    expect(panels.every((p) => p.querySelector('button')!.hidden)).toBe(true);
    shell.open(1, trigger);
    expect(shell.openLevel()).toBeNull();
    fixture.destroy();
    expect(shell.levels().size).toBe(0);
  });
});
