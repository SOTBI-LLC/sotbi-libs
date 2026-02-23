import type {
  HttpErrorResponse,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import {
  HttpClient,
  HttpEventType,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Attachment, ExchangeFile, Remaining } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { MessageService } from './message.service';

export interface Upload1CResponse {
  id: string;
  file_name: string;
}

export interface UploadResponse {
  file: string;
  original_file_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DownloadUploadService {
  private readonly http = inject(HttpClient);
  private readonly messenger = inject(MessageService);

  public upload(
    id: string,
    files: FileList,
  ): Observable<Attachment[] | ExchangeFile[]> {
    if (files.length > 0) {
      const formData = new FormData();
      const fl = files.length;
      for (let i = 0; i < fl; i++) {
        const file = files.item(i);
        if (file) {
          formData.append('files', file, file.name);
        }
      }
      const req = new HttpRequest('POST', `/api/upload/${id}`, formData, {
        reportProgress: true,
      });
      return this.http.request<Attachment[] | ExchangeFile[]>(req).pipe(
        filter(
          (event): event is HttpResponse<Attachment[] | ExchangeFile[]> =>
            event.type === HttpEventType.Response,
        ),
        map((event) => event.body as Attachment[] | ExchangeFile[]),
        catchError((err) => throwError(() => err)),
      );
    }
    return of([]);
  }

  public upload1С(formData: FormData): Observable<Remaining[]> {
    return this.http.post<Remaining[]>('/api/upload/1cexchange', formData);
  }

  public uploadOne(
    id: string,
    formData: FormData,
  ): Observable<UploadResponse[]> {
    return this.http.post<UploadResponse[]>(`/api/upload/${id}`, formData);
  }

  public uploadTxt(id: string, formData: FormData) {
    return this.http.post(`/api/upload/${id}`, formData);
  }

  public uploadPdf(formData: FormData): Observable<Remaining | string> {
    return this.http.post<Remaining>('/api/upload/pdf', formData);
  }

  /**
   * download
   */
  public download(
    path: string,
    params: HttpParams = new HttpParams(),
  ): Observable<Blob> {
    return this.http.get(path, { params, responseType: 'blob' });
  }

  /**
   * deleteFile
   */
  public delete(id: string, file: string) {
    return this.http.delete(`/api/upload/${id}/${file}`).toPromise();
  }

  private getEventMessage(event: HttpEvent<unknown>, files: FileList): unknown {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading of ${files.length} files`;

      case HttpEventType.UploadProgress: {
        // Compute and show the % done:
        const percentDone = event.total
          ? Math.round((100 * event.loaded) / event.total)
          : 0;
        return `Files is ${percentDone}% uploaded.`;
      }

      case HttpEventType.Response:
        return event.body;

      default:
        return `File surprising upload event: ${event.type}.`;
    }
  }

  private handleError() {
    // private handleError(file: File) {
    const userMessage = `Сбой загрузки файла.`;

    return (error: HttpErrorResponse) => {
      // TODO: send the error to remote logging infrastructure
      // console.error(error); // log to console instead

      const message =
        error.error instanceof Error
          ? error.error.message
          : `${error.error}, Код ошибки ${error.status}`;

      this.messenger.add(`${userMessage} ${message}`);

      // Let app keep running but indicate failure.
      return of(userMessage);
    };
  }

  private showProgress(message: unknown) {
    this.messenger.add(message + '');
  }
}
