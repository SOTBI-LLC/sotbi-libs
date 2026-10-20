import { InteractivityChecker } from '@angular/cdk/a11y';
import { Dialog, type DialogRef } from '@angular/cdk/dialog';
import { hasModifierKey } from '@angular/cdk/keycodes';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  output,
  PendingTasks,
  type TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { ClrIcon } from '@clr/angular';
import { ClarityIcons, windowCloseIcon } from '@clr/angular/icon';
import type { SidePanelSize } from '../side-panel/side-panel-config';
import { DialogScrollService } from './dialog-scroll.service';

let nextDialogId = 0;

@Component({
  selector: 'sotbi-modal',
  host: { style: 'display: contents' },
  imports: [ClrIcon],
  templateUrl: './native-modal.component.html',
  styleUrl: './native-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NativeModalComponent {
  public readonly open = model(false);
  public readonly closable = input(true);
  public readonly preventClose = input(false);
  public readonly staticBackdrop = input(true);
  public readonly size = input<SidePanelSize>('md');
  public readonly presentation = input<'modal' | 'panel'>('modal');
  public readonly labelledBy = input('');
  public readonly closeButtonLabel = input('Close');
  public readonly alternateClose = output<boolean>();
  protected readonly titleId = `sotbi-dialog-title-${nextDialogId++}`;
  protected readonly hostClasses =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.className;
  private readonly pending = inject(PendingTasks);
  private readonly dialogs = inject(Dialog);
  private readonly scroll = inject(DialogScrollService);
  private readonly interactivity = inject(InteractivityChecker);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly content = viewChild<TemplateRef<unknown>>('dialogContent');
  private ref?: DialogRef;
  private finishClosingTask?: () => void;
  private closing?: ReturnType<typeof setTimeout>;
  private lastObservedOpen = false;

  constructor() {
    ClarityIcons.addIcons(windowCloseIcon);
    afterRenderEffect(() => {
      const open = this.open();
      const content = this.content();
      const reopened = open && !this.lastObservedOpen;
      this.lastObservedOpen = open;
      if (reopened && this.ref && this.closing) {
        this.cancelClosing();
        this.ref.removePanelClass('sotbi-dialog-leaving');
        this.ref.overlayRef.backdropElement?.classList.remove(
          'sotbi-dialog-leaving',
        );
      }
      if (open && content && !this.ref) this.mount(content);
      else if (!open && this.ref && !this.closing) this.leave(false);
    });
    inject(DestroyRef).onDestroy(() => this.dispose());
  }

  public requestClose(): void {
    if (
      !this.ref ||
      this.dialogs.openDialogs[this.dialogs.openDialogs.length - 1] !==
        this.ref ||
      this.closing
    )
      return;
    // Preserve the existing alternate-close guard before checking closable.
    if (this.preventClose()) {
      this.alternateClose.emit(false);
      return;
    }
    if (this.closable()) this.leave(true);
  }

  private mount(content: TemplateRef<unknown>): void {
    const ref = this.dialogs.open(content, {
      viewContainerRef: this.viewContainer,
      panelClass: 'sotbi-modal-pane',
      width: '100vw',
      height: '100vh',
      backdropClass: ['modal-backdrop', 'sotbi-dialog-backdrop'],
      ariaModal: true,
      ariaLabelledBy: this.labelledBy() || this.titleId,
      autoFocus: '.modal-title-wrapper',
      restoreFocus: true,
      // Guards and the exit animation run before closing the CDK reference.
      disableClose: true,
      disableAnimations: true,
      closeOnNavigation: false,
      closeOnDestroy: false,
      scrollStrategy: this.scroll.strategy(this.presentation() === 'modal'),
    });
    this.ref = ref;
    ref.overlayRef.backdropElement?.addEventListener('mousedown', (event) => {
      if (this.staticBackdrop()) event.preventDefault();
    });
    const initial =
      ref.overlayRef.overlayElement.querySelector<HTMLElement>(
        '[cdkFocusInitial]',
      );
    if (initial && this.interactivity.isFocusable(initial))
      ref.config.autoFocus = '[cdkFocusInitial]';
    ref.keydownEvents.subscribe((event) => {
      if (
        event.key === 'Escape' &&
        !event.repeat &&
        !event.defaultPrevented &&
        !hasModifierKey(event)
      ) {
        event.preventDefault();
        this.requestClose();
      }
    });
    ref.backdropClick.subscribe(() => {
      if (!this.staticBackdrop()) this.requestClose();
    });
  }

  private leave(notify: boolean): void {
    this.ref?.addPanelClass('sotbi-dialog-leaving');
    this.ref?.overlayRef.backdropElement?.classList.add('sotbi-dialog-leaving');
    this.finishClosingTask = this.pending.add();
    this.closing = setTimeout(() => {
      this.closing = undefined;
      const finishTask = this.finishClosingTask;
      this.finishClosingTask = undefined;
      this.dispose();
      if (notify) this.open.set(false);
      finishTask?.();
    }, 200);
  }

  private cancelClosing(): void {
    if (this.closing) clearTimeout(this.closing);
    this.closing = undefined;
    this.finishClosingTask?.();
    this.finishClosingTask = undefined;
  }

  private dispose(): void {
    this.cancelClosing();
    this.ref?.close();
    this.ref = undefined;
  }
}
