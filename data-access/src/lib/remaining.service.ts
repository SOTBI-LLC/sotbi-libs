import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Remaining } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RemainingService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Remaining[]> {
    return this.http.get<Remaining[]>('/api/remainings');
  }

  public get(id: number): Observable<Remaining> {
    return this.http.get<Remaining>(`/api/remaining/${id}`);
  }

  public delete$(id: number): Observable<void> {
    return this.http.delete<void>(`/api/remaining/${id}`);
  }
}
