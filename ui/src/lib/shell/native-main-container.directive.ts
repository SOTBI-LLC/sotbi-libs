import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type NavigationLevel = 1 | 2;
export interface ShellNavigationPanel {
  readonly id: string;
  setOpen(open: boolean, mobile: boolean): void;
}

/** One coordinator per shell; nested shells never share menu state. */
@Directive({
  selector: '[libMainContainer]',
  host: {
    class: 'main-container',
    '[class.open-hamburger-menu]': 'openLevel() === 1',
    '[class.open-overflow-menu]': 'openLevel() === 2',
  },
})
export class NativeMainContainerDirective {
  public readonly openLevel = signal<NavigationLevel | null>(null);
  public readonly levels = signal<
    ReadonlyMap<NavigationLevel, ShellNavigationPanel>
  >(new Map());
  public readonly mobile = signal(false);
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private trigger: HTMLElement | null = null;
  private readonly document = inject(DOCUMENT);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;
      // Match the inclusive @clr/ui responsive CSS breakpoint.
      const resize = () => {
        this.mobile.set(view.innerWidth <= 992);
        this.close(this.mobile());
        for (const panel of this.levels().values())
          panel.setOpen(false, this.mobile());
      };
      resize();
      view.addEventListener('resize', resize);
      destroyRef.onDestroy(() => view.removeEventListener('resize', resize));
    });
  }

  public ownsTarget(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      target.closest('[libMainContainer]') === this.element
    );
  }

  public register(level: NavigationLevel, panel: ShellNavigationPanel): void {
    this.levels.update((current) => new Map(current).set(level, panel));
    panel.setOpen(false, this.mobile());
  }

  public unregister(level: NavigationLevel, panel: ShellNavigationPanel): void {
    if (this.levels().get(level) !== panel) return;
    if (this.openLevel() === level) this.close();
    this.levels.update((current) => {
      const next = new Map(current);
      next.delete(level);
      return next;
    });
  }

  public open(level: NavigationLevel, trigger: HTMLElement): void {
    if (!this.mobile()) return;
    const panel = this.levels().get(level);
    if (!panel) return;
    this.close(false);
    this.trigger = trigger;
    this.openLevel.set(level);
    panel.setOpen(true, true);
  }

  public close(restoreFocus = true): void {
    const level = this.openLevel();
    if (level !== null) this.levels().get(level)?.setOpen(false, this.mobile());
    this.openLevel.set(null);
    const trigger = this.trigger;
    this.trigger = null;
    if (restoreFocus && trigger?.isConnected) trigger.focus();
  }
}
