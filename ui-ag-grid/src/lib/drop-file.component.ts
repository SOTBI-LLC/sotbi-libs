import { Component, inject, signal } from '@angular/core';
import {
  ClrIconModule,
  ClrLoadingButtonModule,
  ClrLoadingModule,
  ClrLoadingState,
} from '@clr/angular';
import { EgrnAttachmentService } from '@services/egrn-attachment.service';
import { DownloadUploadService } from '@services/upload.service';
import { download } from '@shared/shared-globals';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { GridApi } from 'ag-grid-community';

export interface IDropFileResult {
  file?: string;
  original_file_name?: string;
}

@Component({
  template: `
    <div style="display: flex; align-items: center">
      <cds-icon
        style="cursor: pointer; color: #00567a; margin-left: 0.5rem"
        (click)="file.click()"
        shape="upload"
      ></cds-icon>
      <button
        [style.cursor]="value()?.original_file_name ? '' : 'default'"
        [clrLoading]="uploadBtnState()"
        (click)="download(value)"
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
  imports: [ClrIconModule, ClrLoadingButtonModule, ClrLoadingModule],
})
export class DropFileComponent implements ICellEditorAngularComp {
  private readonly uploadSrv = inject(DownloadUploadService);
  private readonly attachmentService = inject(EgrnAttachmentService);

  protected readonly value = signal<IDropFileResult>({});
  protected readonly uploadBtnState = signal<ClrLoadingState>(
    ClrLoadingState.DEFAULT,
  );
  private api: GridApi;
  private path: string;

  public agInit(params): void {
    this.api = params.api;
    const { original_file_name, file } = params.data;
    this.value.set({ original_file_name, file });
    this.path = params.path;
  }

  public getValue() {
    return this.value();
  }

  public isPopup(): boolean {
    return false;
  }

  protected upload(input: HTMLInputElement) {
    if (input.files.length > 0) {
      this.uploadBtnState.set(ClrLoadingState.LOADING);
      try {
        this.uploadSrv.upload(this.path, input.files).subscribe((msg) => {
          this.value.update((prev) => ({
            ...prev,
            original_file_name: msg[0].original_file_name,
            file: msg[0].file,
          }));
          this.uploadBtnState.set(ClrLoadingState.SUCCESS);
          this.api.stopEditing(false);
        });
      } catch (error) {
        console.error(error);
        this.uploadBtnState.set(ClrLoadingState.ERROR);
      }
    }
  }

  protected download(attachment) {
    if (attachment.file) {
      download(attachment, this.attachmentService).subscribe();
    }
  }
}
