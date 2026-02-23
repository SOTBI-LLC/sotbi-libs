import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { MessageAttachment, UploadResult } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class MessageEfrsbAttachmentService extends CommonService<MessageAttachment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/message-attachment';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public deleteFile(file: string): Observable<void> {
    return this.http.delete<void>('/api/upload/message-attachment', {
      body: {
        file,
      },
    });
  }

  public upload(formData: FormData): Observable<UploadResult[]> {
    return this.http.post<UploadResult[]>(
      '/api/upload/message-attachment',
      formData,
    );
  }
}
