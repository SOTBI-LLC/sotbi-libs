import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DebtorDownloadRequest, TaskResponse } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MakeTaskService {
  private readonly http = inject(HttpClient);

  public Do(
    path: string,
    params: HttpParams = new HttpParams(),
  ): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(path, { params });
  }

  public post(
    path: string,
    body: DebtorDownloadRequest,
  ): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(path, body);
  }
}
