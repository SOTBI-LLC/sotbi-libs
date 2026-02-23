import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MakeTaskService {
  private readonly http = inject(HttpClient);

  public Do(
    path: string,
    params: HttpParams = new HttpParams(),
  ): Observable<{ task_id: bigint; status: string }> {
    return this.http.get<{ task_id: bigint; status: string }>(path, { params });
  }
}
