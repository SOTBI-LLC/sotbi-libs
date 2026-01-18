import { Component, inject } from '@angular/core';
import { PaymentAttachmentService } from '@root/service/payment-attachment.service';
import { DownloadFile } from '@services/common.service';
import { checkXlsFileType, download } from '@shared/shared-globals';
import { Remaining } from '@sotbi/models';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  template: `
    @if (attachment.original_file_name) {
      <a
        href="javascript:void(0);"
        (click)="onDownload(attachment)"
        [title]="attachment.original_file_name"
      >
        <svg
          width="16"
          viewBox="0 0 32 32"
          style="vertical-align: middle;"
          xmlns="http://www.w3.org/2000/svg"
        >
          <use attr.xlink:href="#{{ type }}"></use>
        </svg>
        &nbsp;{{ attachment.original_file_name }}</a
      >
    }
  `,
  styles: [],
  standalone: true,
})
export class FileTypeRendererComponent implements ICellRendererAngularComp {
  private readonly attachmentService = inject(PaymentAttachmentService);

  protected type: string;
  protected attachment: DownloadFile;

  public agInit({ data, value }: ICellRendererParams<Remaining, string>) {
    this.attachment = {
      file: value,
      original_file_name: value.split(/[/\\]/).pop(),
    };

    if (data.type) {
      this.type = 'svg-pdf';
      if (checkXlsFileType(value)) {
        this.type = 'svg-excel';
      }
    } else {
      this.type = 'svg-txt';
    }
  }

  protected onDownload(attachment: DownloadFile) {
    download(attachment, this.attachmentService).subscribe();
  }

  public refresh(): boolean {
    return false;
  }
}
