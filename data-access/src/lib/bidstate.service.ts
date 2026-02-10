import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { BidState } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BidStateService {
  private http = inject(HttpClient);

  public getAll(): Observable<BidState[]> {
    return this.http.get<BidState[]>(`/api/bidstates`);
  }

  public get(id: number): Observable<BidState> {
    return this.http.get<BidState>(`/api/bidstate/${id}`);
  }

  public create(item: Partial<BidState>) {
    return this.http.post<BidState>('/api/bidstate', item);
  }

  public update(item: Partial<BidState>): Observable<BidState> {
    const { id } = item;
    return this.http.put<BidState>(`/api/bidstate/${id}`, removeID(item));
  }

  public batchUpdate(items: BidState[]): Observable<BidState[]> {
    return this.http.put<BidState[]>('/api/bidstates', items);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bidstate/${id}`);
  }
}
