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
import { NativeModalComponent } from '../native-modal/native-modal.component';
import { SIDE_PANEL_CONFIG, type SidePanelSize } from './side-panel-config';
import { SidePanelRef } from './side-panel-ref';
import { restorePanelFocus } from './side-panel-focus';

/** Shared declarative shell, also used by dynamically opened panel content. */
@Component({
  selector: 'sotbi-side-panel',
  encapsulation: ViewEncapsulation.None,
  imports: [NativeModalComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #title><ng-content select="[panelTitle]" /></ng-template>
    <ng-template #body
      ><ng-content select="[panelBody]" /><ng-content
    /></ng-template>
    <ng-template #actions><ng-content select="[panelActions]" /></ng-template>
    @if (presentation() === 'modal') {
      <sotbi-modal
        class="sotbi-panel"
        [open]="opened()"
        [staticBackdrop]="true"
        [preventClose]="true"
        [closable]="!blockedState()"
        closeButtonLabel="Закрыть"
        (alternateClose)="requestClose()"
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
      </sotbi-modal>
    } @else {
      <sotbi-modal
        presentation="panel"
        class="sotbi-panel"
        [open]="opened()"
        [size]="size()"
        [staticBackdrop]="true"
        [preventClose]="true"
        [closable]="!blockedState()"
        closeButtonLabel="Закрыть"
        (alternateClose)="requestClose()"
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
      </sotbi-modal>
    }
    <sotbi-modal
      [open]="confirmationOpen()"
      [staticBackdrop]="true"
      [preventClose]="true"
      (alternateClose)="answer(false)"
      closeButtonLabel="Продолжить редактирование"
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
    </sotbi-modal>
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
      .sotbi-panel .modal-body .modal-body {
        margin: 0;
        padding: 0;
      }
      .sotbi-panel .side-panel-footer {
        display: contents;
      }
      .sotbi-panel .modal-footer {
        flex-wrap: wrap;
      }
      .sotbi-panel .modal-footer > div[panelActions] {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.3rem;
      }
      .sotbi-panel .modal-footer > div[panelActions] > .btn {
        margin: 0;
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
  private readonly document = inject(DOCUMENT);
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
    const document = this.document;
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
