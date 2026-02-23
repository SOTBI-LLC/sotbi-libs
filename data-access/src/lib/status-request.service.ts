import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { StatusRequest } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatusRequestService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<StatusRequest[]> {
    return this.http.get<StatusRequest[]>(`/api/statuses`);
  }

  public get(id: number): Observable<StatusRequest> {
    return this.http.get<StatusRequest>(`/api/status/${id}`);
  }

  public create(item: Partial<StatusRequest>) {
    return this.http.post<StatusRequest>('/api/status', item);
  }

  public update(item: Partial<StatusRequest>): Observable<StatusRequest> {
    const { id } = item;
    return this.http.put<StatusRequest>(`/api/status/${id}`, removeID(item));
  }

  public batchUpdate(items: StatusRequest[]): Observable<StatusRequest[]> {
    return this.http.put<StatusRequest[]>('/api/statuses', items);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/status/${id}`);
  }
}
