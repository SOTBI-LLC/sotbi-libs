import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { PaymentAttachment, UploadResult } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentAttachmentService extends CommonService<PaymentAttachment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/payment-attachment';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public deleteFile(file: string): Observable<void> {
    return this.http.delete<void>('/api/upload/payment-attachment', {
      body: {
        file,
      },
    });
  }

  public upload(formData: FormData): Observable<UploadResult[]> {
    return this.http.post<UploadResult[]>(
      '/api/upload/payment-attachments',
      formData,
    );
  }

  public deleteMultiple(file: string[]): Observable<void> {
    return this.http.delete<void>(`${this.path}s/download`, {
      params: { file },
    });
  }
}
