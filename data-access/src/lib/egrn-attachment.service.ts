import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { EgrnAttachment, UploadResult } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class EgrnAttachmentService extends CommonService<EgrnAttachment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/egrn';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public deleteFile(file: string): Observable<void> {
    return this.http.delete<void>('/api/upload/egrn', {
      body: {
        file,
      },
    });
  }

  public upload(formData: FormData): Observable<UploadResult[]> {
    return this.http.post<UploadResult[]>('/api/upload/egrn', formData);
  }
}
