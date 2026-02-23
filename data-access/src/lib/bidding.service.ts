import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Bidding, Initiator } from '@sotbi/models';
import { paramsToOptions } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BiddingService {
  private http = inject(HttpClient);

  public getAll(
    id: number,
    iid: number,
    params: Record<string, string> | number | null = {},
  ): Observable<Bidding[]> {
    return this.http.get<Bidding[]>(
      `/api/biddings/${iid}/debtor/${id}`,
      paramsToOptions(params),
    );
  }

  public getAllGrouped(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<Initiator[]> {
    return this.http.get<Initiator[]>(
      `/api/biddings/${id}/grouped`,
      paramsToOptions(params),
    );
  }

  public get(id: number): Observable<Bidding> {
    return this.http.get<Bidding>(`/api/bidding/${id}`);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bidding/${id}`);
  }

  public restore(id: number): Observable<Bidding> {
    return this.http.patch<Bidding>(`/api/bidding/${id}`, {});
  }

  public save(bidding: Partial<Bidding>, id: number): Observable<Bidding> {
    return this.http.put<Bidding>(`/api/bidding/${id}`, bidding);
  }

  public create(bidding: Partial<Bidding>): Observable<Bidding> {
    return this.http.post<Bidding>('/api/bidding', bidding);
  }
}
