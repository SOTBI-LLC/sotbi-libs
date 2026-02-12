import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Label } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LabelService {
  private http = inject(HttpClient);

  public create(item: Partial<Label>): Observable<Label> {
    return this.http.post<Label>(`/api/label`, item);
  }

  public getAll(): Observable<Label[]> {
    return this.http.get<Label[]>('/api/labels');
  }

  public get(id: number): Observable<Label> {
    return this.http.get<Label>(`/api/label/${id}`);
  }

  public update(id: number, item: Partial<Label>): Observable<Label> {
    return this.http.put<Label>(`/api/label/${id}`, item);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/label/${id}`);
  }
}
