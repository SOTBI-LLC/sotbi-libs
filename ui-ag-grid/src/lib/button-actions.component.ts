import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M27.36 4H6C4.89543 4 4 4.89543 4 6V30C4 31.1046 4.89543 32 6 32H30C31.1046 32 32 31.1046 32 30V8.78L27.36 4ZM25 30H11V22H25V30ZM27 30H30V9.59L26.51 6H12V12H26C26 13.1046 25.1046 14 24 14H12C10.8954 14 10 13.1046 10 12V6H6V30H9V22C9 20.8954 9.89543 20 11 20H25C26.1046 20 27 20.8954 27 22V30Z"
          />
        </svg>
      </button>
    }
    @if (showCancel) {
      <button
        type="button"
        class="btn btn-icon btn-link btn-sm narrow"
        aria-label="Отменить"
        [disabled]="!(needSave() && canCancel())"
        (click)="onCancel()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M19.4696 17.9732L27.7596 9.70542C28.0994 9.30972 28.0765 8.71987 27.7071 8.35148C27.3378 7.9831 26.7463 7.96032 26.3496 8.29919L18.0596 16.567L9.76958 8.28922C9.37745 7.89814 8.7417 7.89814 8.34958 8.28922C7.95745 8.68029 7.95745 9.31434 8.34958 9.70542L16.6496 17.9732L8.34958 26.241C8.0642 26.4848 7.93989 26.8675 8.02777 27.2318C8.11564 27.5961 8.40086 27.8806 8.76616 27.9682C9.13146 28.0559 9.51519 27.9319 9.75958 27.6473L18.0596 19.3795L26.3496 27.6473C26.7463 27.9861 27.3378 27.9634 27.7071 27.595C28.0765 27.2266 28.0994 26.6367 27.7596 26.241L19.4696 17.9732Z"
          />
        </svg>
      </button>
    }
    @if (showDelete) {
      <button
        type="button"
        class="btn btn-icon btn-link btn-sm narrow"
        aria-label="Удалить"
        (click)="onDelete()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 36 36"
          aria-hidden="true"
          class="is-error"
        >
          <path
            fill="currentColor"
            d="M27.98 31C28 31.25 27.92 31.49 27.76 31.68C27.6 31.87 27.37 31.98 27.12 32H8.85C8.6 31.98 8.37 31.87 8.21 31.68C8.05 31.49 7.97 31.25 7.99 31V11.03H5.97V31C5.95 31.78 6.24 32.53 6.78 33.09C7.32 33.65 8.06 33.98 8.85 34H27.12C27.9 33.98 28.65 33.66 29.19 33.09C29.73 32.52 30.02 31.77 30 31V11.03H27.98V31ZM13 12.98V27.98H15.02V12.98H13ZM15 4H21V6H23V4C23 2.9 22.1 2 21 2H15C13.9 2 13 2.9 13 4V6H15V4ZM30.99 6.98H5.01C4.45 6.98 4 7.43 4 7.98C4 8.53 4.45 8.98 5.01 8.98H30.99C31.55 8.98 32 8.53 32 7.98C32 7.43 31.55 6.98 30.99 6.98ZM20.98 12.98V27.98H23V12.98H20.98Z"
          />
        </svg>
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonActionsComponent implements ICellRendererAngularComp {
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
        : true,
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
