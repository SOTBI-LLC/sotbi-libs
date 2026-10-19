import { LoadingButtonState, LoadingButtonComponent } from '@sotbi/ui';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClrIcon } from '@clr/angular';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { GridApi, ICellEditorParams } from 'ag-grid-community';
import type { Observable } from 'rxjs';
import type { DownloadFileDescriptor } from '../file-download';
import { downloadAttachment } from '../file-download';

export type IDropFileResult = DownloadFileDescriptor;

export interface DropFileParams extends ICellEditorParams<IDropFileResult> {
  uploadFiles: (files: FileList) => Observable<IDropFileResult[]>;
  downloadFile: (attachment: IDropFileResult) => Observable<BlobPart>;
}

@Component({
  template: `
    <div style="display: flex; align-items: center">
      <clr-icon
        style="cursor: pointer; color: #00567a; margin-left: 0.5rem"
        (click)="file.click()"
        shape="upload"
      ></clr-icon>
      <button
        [style.cursor]="value()?.original_file_name ? '' : 'default'"
        [sotbiLoading]="uploadBtnState()"
        (click)="download(value())"
        class="btn btn-link link-upload btn-upload"
        style="text-overflow: ellipsis;
      height: 25px;
      margin-left: .3rem;"
      >
        {{ value()?.original_file_name || 'Загрузить' }}
      </button>
      <input
        type="file"
        name="file"
        id="file"
        #file
        style="display: none;"
        (change)="upload(file)"
      />
    </div>
  `,
  styles: [],
  imports: [LoadingButtonComponent, ClrIcon],
})
export class DropFileComponent implements ICellEditorAngularComp {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly value = signal<IDropFileResult>({});
  protected readonly uploadBtnState = signal<LoadingButtonState>(
    LoadingButtonState.DEFAULT,
  );
  private api!: GridApi;
  private uploadFiles!: DropFileParams['uploadFiles'];
  private downloadFile!: DropFileParams['downloadFile'];

  public agInit(params: DropFileParams): void {
    this.api = params.api;
    const { original_file_name, file } = params.data;
    this.value.set({ original_file_name, file });
    this.uploadFiles = params.uploadFiles;
    this.downloadFile = params.downloadFile;
  }

  public getValue(): IDropFileResult {
    return this.value();
  }

  public isPopup(): boolean {
    return false;
  }

  protected upload(input: HTMLInputElement): void {
    if (input.files && input.files.length > 0) {
      this.uploadBtnState.set(LoadingButtonState.LOADING);
      try {
        this.uploadFiles(input.files)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((msg) => {
            this.value.update((prev) => ({
              ...prev,
              original_file_name: msg[0].original_file_name,
              file: msg[0].file,
            }));
            this.uploadBtnState.set(LoadingButtonState.SUCCESS);
            this.api.stopEditing(false);
          });
      } catch (error) {
        console.error(error);
        this.uploadBtnState.set(LoadingButtonState.ERROR);
      }
    }
  }

  protected download(attachment: IDropFileResult): void {
    if (attachment.file) {
      downloadAttachment(attachment, { download: this.downloadFile })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }
}
