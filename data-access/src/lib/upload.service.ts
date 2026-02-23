import type { HttpErrorResponse, HttpEvent } from '@angular/common/http';
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
import { catchError, last, map, tap } from 'rxjs/operators';
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
        formData.append('files', files.item(i), files.item(i).name);
      }
      const req = new HttpRequest('POST', `/api/upload/${id}`, formData, {
        reportProgress: true,
      });
      return this.http.request(req).pipe(
        map((event) => this.getEventMessage(event, files)),
        tap((message) => this.showProgress(message)),
        last(), // return last (completed) message to caller
        catchError((err) => throwError(err)),
      );
    }
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
        const percentDone = Math.round((100 * event.loaded) / event.total);
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
