import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  Attachment,
  AttachmentHistory,
  UploadResult,
} from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';
import type { DownloadFile } from './common.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService extends CommonService<Attachment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/advert';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAll(id: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.path}/${id}/attachments`);
  }

  public save(
    id: number,
    file: number,
    item: Partial<Attachment>,
  ): Observable<Attachment> {
    return this.http.put<Attachment>(
      `${this.path}/${id}/attachment/${file}`,
      item,
    );
  }

  public create(id: number, item: Attachment): Observable<Attachment> {
    return this.http.post<Attachment>(
      `${this.path}/${id}/attachment`,
      removeID(item),
    );
  }

  public override delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/0/attachment/${id}`);
  }

  public deleteFile(file: DownloadFile): Observable<void> {
    return this.http.delete<void>('/api/upload/advert', { body: file });
  }

  public upload(formData: FormData): Observable<UploadResult[]> {
    return this.http.post<UploadResult[]>('/api/upload/advert', formData);
  }

  /**
   * Get change history of attachments
   */
  public history(id: number): Observable<AttachmentHistory[]> {
    // 9999 - заглушка, для того что бы роуты выглядели одинаково. По факту, № объявления не нужен
    return this.http.get<AttachmentHistory[]>(
      `${this.path}/9999/attachment/${id}/history`,
    );
  }
}
