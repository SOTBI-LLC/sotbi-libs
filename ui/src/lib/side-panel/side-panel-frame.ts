import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClrModalModule, ClrSidePanelModule } from '@clr/angular';
import { SIDE_PANEL_CONFIG, type SidePanelSize } from './side-panel-config';
import { SidePanelRef } from './side-panel-ref';
import { restorePanelFocus } from './side-panel-focus';

/** Shared declarative shell, also used by dynamically opened panel content. */
@Component({
  selector: 'sotbi-side-panel',
  host: { '(keyup.escape)': 'onEscape($event)' },
  encapsulation: ViewEncapsulation.None,
  imports: [ClrSidePanelModule, ClrModalModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #title><ng-content select="[panelTitle]" /></ng-template>
    <ng-template #body
      ><ng-content select="[panelBody]" /><ng-content
    /></ng-template>
    <ng-template #actions><ng-content select="[panelActions]" /></ng-template>
    @if (presentation() === 'modal') {
      <clr-modal
        class="sotbi-panel"
        [clrModalOpen]="opened()"
        [clrModalStaticBackdrop]="true"
        [clrModalPreventClose]="true"
        [clrModalClosable]="!blockedState()"
        clrModalCloseButtonAriaLabel="Закрыть"
        (clrModalAlternateClose)="requestClose()"
      >
        <div class="modal-title">
          <ng-container *ngTemplateOutlet="title" />
        </div>
        <div class="modal-body" [attr.aria-busy]="blockedState()">
          <ng-container *ngTemplateOutlet="body" />
        </div>
        <div class="modal-footer">
          <ng-container *ngTemplateOutlet="actions" />
        </div>
      </clr-modal>
    } @else {
      <clr-side-panel
        class="sotbi-panel"
        [clrSidePanelOpen]="opened()"
        [clrSidePanelSize]="size()"
        [clrSidePanelStaticBackdrop]="true"
        [clrSidePanelPreventClose]="true"
        [clrSidePanelClosable]="!blockedState()"
        clrSidePanelCloseButtonAriaLabel="Закрыть"
        (clrSidePanelAlternateClose)="requestClose()"
      >
        <div class="side-panel-title">
          <ng-container *ngTemplateOutlet="title" />
        </div>
        <div class="side-panel-body" [attr.aria-busy]="blockedState()">
          <ng-container *ngTemplateOutlet="body" />
        </div>
        <div class="side-panel-footer">
          <ng-container *ngTemplateOutlet="actions" />
        </div>
      </clr-side-panel>
    }
    <clr-modal
      [clrModalOpen]="confirmationOpen()"
      [clrModalStaticBackdrop]="true"
      [clrModalPreventClose]="true"
      (clrModalAlternateClose)="answer(false)"
      clrModalCloseButtonAriaLabel="Продолжить редактирование"
    >
      <h3 class="modal-title">Закрыть без сохранения?</h3>
      <div class="modal-body">Несохранённые изменения будут потеряны.</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" (click)="answer(false)">
          Продолжить редактирование
        </button>
        <button type="button" class="btn btn-danger" (click)="answer(true)">
          Не сохранять
        </button>
      </div>
    </clr-modal>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .sotbi-panel .modal-title {
        margin: 0;
      }
      .sotbi-panel .modal-body {
        min-height: 0;
        overflow: auto;
      }
      .sotbi-panel .side-panel-footer {
        display: contents;
      }
      .sotbi-panel .modal-footer {
        flex-wrap: wrap;
      }
      @media (max-width: 767px) {
        .sotbi-panel.side-panel .modal-dialog {
          width: 100vw !important;
          max-width: 100vw !important;
        }
      }
    `,
  ],
})
export class SidePanelFrameComponent {
  private readonly supplied = inject(SidePanelRef, { optional: true });
  private readonly config = inject(SIDE_PANEL_CONFIG, { optional: true });
  public readonly interaction = this.supplied ?? new SidePanelRef();
  public readonly size = input<SidePanelSize>(this.config?.size ?? 'md');
  public readonly presentation = input<'panel' | 'modal'>('panel');
  public readonly dirty = input(false);
  public readonly blocked = input(false);
  protected readonly blockedState = computed(() => {
    const blocked = this.blocked();
    return blocked || this.interaction.blocked;
  });
  public readonly cancelled = output<void>();
  protected readonly opened = signal(true);
  protected readonly confirmationOpen = signal(false);
  private answerConfirmation?: (discard: boolean) => void;

  constructor() {
    const document = inject(DOCUMENT);
    const initiator = document.activeElement as HTMLElement | null;
    if (!this.supplied) {
      this.interaction.setState({
        dirty: () => this.dirty(),
        blocked: () => this.blocked(),
      });
    }
    this.interaction.setConfirmation(
      () =>
        new Promise<boolean>((resolve) => {
          this.answerConfirmation = resolve;
          this.confirmationOpen.set(true);
        }),
    );
    this.interaction.closed.pipe(takeUntilDestroyed()).subscribe((outcome) => {
      this.opened.set(false);
      if (outcome.kind === 'cancelled') this.cancelled.emit();
    });
    inject(DestroyRef).onDestroy(() => {
      this.answer(false);
      if (!this.supplied)
        queueMicrotask(() => restorePanelFocus(document, initiator));
    });
  }

  protected onEscape(event: Event): void {
    if (
      this.presentation() !== 'panel' ||
      this.confirmationOpen() ||
      event.defaultPrevented
    )
      return;
    // Clarity's side panel bypasses ModalStackService. Keep its Escape local,
    // so the same event does not dismiss the discard modal just opened here.
    event.stopPropagation();
    this.requestClose();
  }

  public requestClose(): void {
    void this.interaction.requestClose();
  }

  protected answer(discard: boolean): void {
    this.confirmationOpen.set(false);
    const resolve = this.answerConfirmation;
    this.answerConfirmation = undefined;
    resolve?.(discard);
  }
}
