import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { InsuranceAttachment, UploadResult } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class InsuranceAttachmentService extends CommonService<InsuranceAttachment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/insurance-attachments';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public deleteFile(file: string): Observable<void> {
    return this.http.delete<void>('/api/upload/insurance', { body: { file } });
  }

  public upload(formData: FormData): Observable<UploadResult[]> {
    return this.http.post<UploadResult[]>('/api/upload/insurance', formData);
  }

  public downloadAll(id: number): Observable<Blob> {
    return this.http.get(`/api/insurance-attachments/${id}/download`, {
      responseType: 'blob',
    });
  }
}
