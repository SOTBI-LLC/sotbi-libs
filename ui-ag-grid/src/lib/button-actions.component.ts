import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ClrIconModule } from '@clr/angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface ExtendedCellRendererParams extends ICellRendererParams {
  onSave?: (node: ICellRendererParams['node']) => void;
  onCancel?: (node: ICellRendererParams['node']) => void;
  onDelete?: (node: ICellRendererParams['node']) => void;
  fieldAsIndicatorForSave?: string;
  requiredFields?: string[];
}

@Component({
  template: `
    @if (showSave) {
    <button
      type="button"
      class="btn btn-icon btn-link btn-sm narrow"
      aria-label="Сохранить"
      (click)="onSave()"
      [disabled]="!(needSave() && canSave())"
      [attr.title]="canSave() ? '' : 'Не все поля заполнены'"
    >
      <cds-icon shape="floppy"></cds-icon>
    </button>
    } @if (showCancel) {
    <button
      type="button"
      class="btn btn-icon btn-link btn-sm narrow"
      aria-label="Отменить"
      [disabled]="!(needSave() && canCancel())"
      (click)="onCancel()"
    >
      <cds-icon shape="times"></cds-icon>
    </button>
    } @if (showDelete) {
    <button
      type="button"
      class="btn btn-icon btn-link btn-sm narrow"
      aria-label="Удалить"
      (click)="onDelete()"
    >
      <cds-icon shape="trash" class="is-error"></cds-icon>
    </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClrIconModule],
})
export class ButtonActionsComponent {
  private params: ExtendedCellRendererParams | null = null;
  protected showSave = false;
  protected showCancel = false;
  protected showDelete = false;
  private fieldAsIndicatorForSave: string | null = null;
  private requiredFields: Array<string> = [];
  protected readonly canSave = signal<boolean>(false);
  protected readonly needSave = signal<boolean>(false);
  protected readonly canCancel = signal<boolean>(false);

  public agInit(params: ICellRendererParams): void {
    this.params = params as ExtendedCellRendererParams;
    this.showSave = !!this.params.onSave;
    this.showCancel = !!this.params.onCancel;
    this.showDelete = !!this.params.onDelete;
    this.fieldAsIndicatorForSave = this.params.fieldAsIndicatorForSave || null;
    this.requiredFields = this.params.requiredFields || [];
  }

  protected onSave() {
    if (this.params?.onSave) {
      return this.params.onSave(this.params.node);
    }
  }

  public refresh(params: ICellRendererParams) {
    this.canSave.set(true);
    for (const field of this.requiredFields) {
      if (!params.node?.data[field]) {
        this.canSave.set(false);
      }
    }
    this.needSave.set(
      this.fieldAsIndicatorForSave
        ? params.node.data && !!params.node.data[this.fieldAsIndicatorForSave]
        : true
    );
    this.canCancel.set(params.node.data.id > 0);
    return true;
  }

  protected onCancel() {
    if (this.params?.onCancel) {
      return this.params.onCancel(this.params.node);
    }
  }

  protected onDelete() {
    if (this.params?.onDelete) {
      return this.params.onDelete(this.params.node);
    }
  }
}
