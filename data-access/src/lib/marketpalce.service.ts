import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Marketplace } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private http = inject(HttpClient);

  public getAll(): Observable<Marketplace[]> {
    return this.http.get<Marketplace[]>('/api/marketplaces');
  }

  public get(id: number): Observable<Marketplace> {
    return this.http.get<Marketplace>(`/api/marketplace/${id}`);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/marketplace/${id}`);
  }

  public save(
    debtor: Partial<Marketplace>,
    id: number,
  ): Observable<Marketplace> {
    return this.http.put<Marketplace>(`/api/marketplace/${id}`, debtor);
  }

  public create(debtor: Partial<Marketplace>): Observable<Marketplace> {
    return this.http.post<Marketplace>('/api/marketplace', debtor);
  }
}
