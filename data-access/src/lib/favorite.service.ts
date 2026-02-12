import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Debtor } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Debtor[]> {
    return this.http.get<Debtor[]>('/api/favorites');
  }

  public deleteAll(): Observable<void> {
    return this.http.delete<void>('/api/favorites');
  }

  public batchUpdate(items: number[]): Observable<Debtor[]> {
    return this.http.put<Debtor[]>('/api/favorites', items);
  }
}
