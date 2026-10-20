import { type FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
  afterNextRender,
  ApplicationRef,
  createComponent,
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  Renderer2,
} from '@angular/core';
import { ClrIcon } from '@clr/angular';
import { ClarityIcons, timesIcon } from '@clr/angular/icon';
import {
  NativeMainContainerDirective,
  type NavigationLevel,
  type ShellNavigationPanel,
} from './native-main-container.directive';

let nextPanelId = 0;

@Directive({ selector: '[libNavLevel]' })
export class NativeNavLevelDirective implements ShellNavigationPanel {
  public readonly libNavLevel = input.required<NavigationLevel>();
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);
  private readonly shell = inject(NativeMainContainerDirective, {
    optional: true,
  });
  public readonly id =
    this.element.id || `sotbi-shell-navigation-${nextPanelId++}`;
  private readonly injector = inject(Injector);
  private trap?: FocusTrap;
  private closeButton?: HTMLButtonElement;

  constructor() {
    const factory = inject(FocusTrapFactory);
    const environmentInjector = inject(EnvironmentInjector);
    const applicationRef = inject(ApplicationRef);
    const destroyRef = inject(DestroyRef);
    ClarityIcons.addIcons(timesIcon);
    afterNextRender(() => {
      this.renderer.setAttribute(this.element, 'id', this.id);
      this.renderer.addClass(
        this.element,
        `clr-nav-level-${this.libNavLevel()}`,
      );
      if (!this.shell) return;
      const button = this.renderer.createElement('button') as HTMLButtonElement;
      this.closeButton = button;
      this.renderer.setAttribute(button, 'type', 'button');
      this.renderer.setAttribute(button, 'aria-label', 'Close navigation');
      this.renderer.addClass(button, 'clr-nav-close');
      const icon = this.renderer.createElement('cds-icon');
      const iconRef = createComponent(ClrIcon, {
        hostElement: icon,
        environmentInjector,
      });
      iconRef.setInput('shape', 'times');
      iconRef.setInput('size', '32');
      applicationRef.attachView(iconRef.hostView);
      iconRef.changeDetectorRef.detectChanges();
      this.renderer.setAttribute(icon, 'aria-hidden', 'true');
      this.renderer.setStyle(icon, 'pointer-events', 'none');
      this.renderer.appendChild(button, icon);
      this.renderer.insertBefore(this.element, button, this.element.firstChild);
      this.trap = factory.create(this.element);
      this.trap.enabled = false;
      const listeners = [
        this.renderer.listen(button, 'click', () => this.shell?.close()),
        // Native close-button keys must not reach the vertical AccordionGroup.
        this.renderer.listen(button, 'keydown', (event: KeyboardEvent) =>
          event.stopPropagation(),
        ),
        this.renderer.listen(
          this.element,
          'keydown',
          (event: KeyboardEvent) => {
            if (
              event.key === 'Escape' &&
              this.shell?.ownsTarget(event.target) &&
              this.shell.openLevel() === this.libNavLevel()
            ) {
              event.preventDefault();
              event.stopPropagation();
              this.shell.close();
            }
          },
          { capture: true },
        ),
        this.renderer.listen(this.element, 'click', (event: MouseEvent) => {
          if (
            this.shell?.mobile() &&
            this.shell.ownsTarget(event.target) &&
            event.target instanceof Element &&
            event.target.closest('a.nav-link')
          )
            this.shell.close();
        }),
      ];
      this.shell.register(this.libNavLevel(), this);
      destroyRef.onDestroy(() => {
        this.shell?.unregister(this.libNavLevel(), this);
        for (const unlisten of listeners) unlisten();
        this.trap?.destroy();
        applicationRef.detachView(iconRef.hostView);
        iconRef.destroy();
        this.renderer.removeChild(this.element, button);
      });
    });
  }

  public setOpen(open: boolean, mobile: boolean): void {
    const hidden = mobile && !open;
    this.renderer.setProperty(this.element, 'hidden', hidden);
    this.renderer.setAttribute(this.element, 'aria-hidden', String(hidden));
    if (this.closeButton)
      this.renderer.setProperty(this.closeButton, 'hidden', !mobile || !open);
    if (this.trap) {
      this.trap.enabled = mobile && open;
      if (mobile && open)
        afterNextRender(
          () => {
            if (this.trap?.enabled) this.trap.focusFirstTabbableElement();
          },
          { injector: this.injector },
        );
    }
  }
}
