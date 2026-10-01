import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { checkXlsFileType, downloadAttachment, DownloadFileDescriptor } from '../file-download';
import type { Remaining } from '@sotbi/models';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Observable } from 'rxjs';

export interface FileTypeRendererParams extends ICellRendererParams<Remaining, string> {
  downloadFile: (attachment: DownloadFileDescriptor) => Observable<BlobPart>;
}

@Component({
  template: `
    @if (attachment.original_file_name) {
      <a
        href="javascript:void(0);"
        (click)="onDownload(attachment)"
        [title]="attachment.original_file_name"
      >
        @switch (type) {
          @case ('svg-pdf') {
            <svg
              data-file-icon="pdf"
              width="16"
              viewBox="0 0 32 32"
              style="vertical-align: middle; fill: darkred;"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.937 5.938c0.578 0.578 1.062 1.734 1.062 2.562v18c0 0.828-0.672 1.5-1.5 1.5h-21c-0.828 0-1.5-0.672-1.5-1.5v-25c0-0.828 0.672-1.5 1.5-1.5h14c0.828 0 1.984 0.484 2.562 1.062zM16 2.125v5.875h5.875c-0.094-0.266-0.234-0.531-0.344-0.641l-4.891-4.891c-0.109-0.109-0.375-0.25-0.641-0.344zM22 26v-16h-6.5c-0.828 0-1.5-0.672-1.5-1.5v-6.5h-12v24h20zM13.969 16.734c0.391 0.313 0.828 0.594 1.312 0.875 0.656-0.078 1.266-0.109 1.828-0.109 1.047 0 2.375 0.125 2.766 0.766 0.109 0.156 0.203 0.438 0.031 0.812-0.016 0.016-0.031 0.047-0.047 0.063v0.016c-0.047 0.281-0.281 0.594-1.109 0.594-1 0-2.516-0.453-3.828-1.141-2.172 0.234-4.453 0.719-6.125 1.297-1.609 2.75-2.844 4.094-3.781 4.094-0.156 0-0.297-0.031-0.438-0.109l-0.375-0.187c-0.047-0.016-0.063-0.047-0.094-0.078-0.078-0.078-0.141-0.25-0.094-0.562 0.156-0.719 1-1.922 2.938-2.938 0.125-0.078 0.281-0.031 0.359 0.094 0.016 0.016 0.031 0.047 0.031 0.063 0.484-0.797 1.047-1.813 1.672-3.078 0.703-1.406 1.25-2.781 1.625-4.094-0.5-1.703-0.656-3.453-0.375-4.484 0.109-0.391 0.344-0.625 0.656-0.625h0.344c0.234 0 0.422 0.078 0.547 0.234 0.187 0.219 0.234 0.562 0.141 1.062-0.016 0.047-0.031 0.094-0.063 0.125 0.016 0.047 0.016 0.078 0.016 0.125v0.469c-0.016 0.984-0.031 1.922-0.219 3 0.547 1.641 1.359 2.969 2.281 3.719zM4.969 23.156c0.469-0.219 1.141-0.891 2.141-2.469-1.172 0.906-1.906 1.937-2.141 2.469zM11.188 8.781c-0.156 0.438-0.156 1.188-0.031 2.063 0.047-0.25 0.078-0.484 0.109-0.688 0.031-0.266 0.078-0.484 0.109-0.672 0.016-0.047 0.031-0.078 0.063-0.125-0.016-0.016-0.016-0.047-0.031-0.078-0.016-0.281-0.109-0.453-0.203-0.562 0 0.031-0.016 0.047-0.016 0.063zM9.25 19.109c1.375-0.547 2.906-0.984 4.438-1.266-0.156-0.125-0.313-0.234-0.453-0.359-0.766-0.672-1.453-1.609-1.984-2.75-0.297 0.953-0.734 1.969-1.297 3.078-0.234 0.438-0.469 0.875-0.703 1.297zM19.344 18.859c-0.078-0.078-0.484-0.375-2.188-0.375 0.766 0.281 1.469 0.438 1.937 0.438 0.141 0 0.219 0 0.281-0.016 0-0.016-0.016-0.031-0.031-0.047z"
              ></path>
            </svg>
          }
          @case ('svg-excel') {
            <svg
              data-file-icon="excel"
              width="16"
              viewBox="0 0 48 48"
              style="vertical-align: middle;"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M41 10H25v28h16a1 1 0 001-1V11a1 1 0 00-1-1z" fill="#4CAF50" />
              <path
                d="M32 15h7v3h-7zm0 10h7v3h-7zm0 5h7v3h-7zm0-10h7v3h-7zm-7-5h5v3h-5zm0 10h5v3h-5zm0 5h5v3h-5zm0-10h5v3h-5z"
                fill="#FFF"
              />
              <path d="M27 42L6 38V10l21-4z" fill="#2E7D32" />
              <path
                d="M19.129 31l-2.411-4.561c-.092-.171-.186-.483-.284-.938h-.037c-.046.215-.154.541-.324.979L13.652 31H9.895l4.462-7.001L10.274 17h3.837l2.001 4.196c.156.331.296.725.42 1.179h.04c.078-.271.224-.68.439-1.22L19.237 17h3.515l-4.199 6.939 4.316 7.059h-3.74V31z"
                fill="#FFF"
              />
            </svg>
          }
          @default {
            <svg
              data-file-icon="txt"
              width="16"
              viewBox="0 0 32 32"
              style="vertical-align: middle;"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.937 5.938c0.578 0.578 1.062 1.734 1.062 2.562v18c0 0.828-0.672 1.5-1.5 1.5h-21c-0.828 0-1.5-0.672-1.5-1.5v-25c0-0.828 0.672-1.5 1.5-1.5h14c0.828 0 1.984 0.484 2.562 1.062zM16 2.125v5.875h5.875c-0.094-0.266-0.234-0.531-0.344-0.641l-4.891-4.891c-0.109-0.109-0.375-0.25-0.641-0.344zM22 26v-16h-6.5c-0.828 0-1.5-0.672-1.5-1.5v-6.5h-12v24h20zM6 12.5c0-0.281 0.219-0.5 0.5-0.5h11c0.281 0 0.5 0.219 0.5 0.5v1c0 0.281-0.219 0.5-0.5 0.5h-11c-0.281 0-0.5-0.219-0.5-0.5v-1zM17.5 16c0.281 0 0.5 0.219 0.5 0.5v1c0 0.281-0.219 0.5-0.5 0.5h-11c-0.281 0-0.5-0.219-0.5-0.5v-1c0-0.281 0.219-0.5 0.5-0.5h11zM17.5 20c0.281 0 0.5 0.219 0.5 0.5v1c0 0.281-0.219 0.5-0.5 0.5h-11c-0.281 0-0.5-0.219-0.5-0.5v-1c0-0.281 0.219-0.5 0.5-0.5h11z"
              ></path>
            </svg>
          }
        }
        &nbsp;{{ attachment.original_file_name }}</a
      >
    }
  `,
  styles: [
    `
      :host {
        display: flex;
      }
      a {
        display: flex;
      }
    `,
  ],
  standalone: true,
})
export class FileTypeRendererComponent implements ICellRendererAngularComp {
  private readonly destroyRef = inject(DestroyRef);
  private downloadFile!: FileTypeRendererParams['downloadFile'];

  protected type!: string;
  protected attachment!: DownloadFileDescriptor;

  public agInit({ data, value, downloadFile }: FileTypeRendererParams) {
    this.downloadFile = downloadFile;
    this.attachment = {
      file: value ?? undefined,
      original_file_name: value!.split(/[/\\]/).pop(),
    };

    if (data?.type) {
      this.type = 'svg-pdf';
      if (checkXlsFileType(value!)) {
        this.type = 'svg-excel';
      }
    } else {
      this.type = 'svg-txt';
    }
  }

  protected onDownload(attachment: DownloadFileDescriptor): void {
    downloadAttachment(attachment, { download: this.downloadFile })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  public refresh(): boolean {
    return false;
  }
}
