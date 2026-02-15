import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AllBidCodes, Attachment, TradingCode } from '@sotbi/models';
import { paramsToOptions, removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BidcodeService {
  private http = inject(HttpClient);

  public GetAllByDebtor(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<TradingCode[]> {
    return this.http.get<TradingCode[]>(
      `/api/bidcodes/debtor/${id}`,
      paramsToOptions(params),
    );
  }

  public GetAll(query = '', prms = {}): Observable<TradingCode[]> {
    const options = paramsToOptions(prms);
    if (query) {
      options.params = options.params.set('q', query);
    }
    return this.http.get<TradingCode[]>(`/api/bidcodes`, options);
  }

  public GetAllFull(): Observable<TradingCode[]> {
    const options = { params: new HttpParams() };
    options.params = options.params.set('limit', '-1');
    return this.http.get<TradingCode[]>(`/api/bidcodes`, options);
  }

  public GetAllByBidding(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<TradingCode[]> {
    return this.http.get<TradingCode[]>(
      `/api/bidcodes/bidding/${id}`,
      paramsToOptions(params),
    );
  }

  public GetFullAllByBidding(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<TradingCode[]> {
    return this.http.get<TradingCode[]>(
      `/api/bidcodes/bidding/${id}/full`,
      paramsToOptions(params),
    );
  }

  public GetExpenseWithoutTradeCode(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(
      `/api/bidcodes/bidding/${id}/empty`,
      paramsToOptions(params),
    );
  }

  public GetByAdvert(
    id: number,
    params: Record<string, string> | number | null = {},
  ): Observable<TradingCode[]> {
    return this.http.get<TradingCode[]>(
      `/api/bidcodes/advert/${id}`,
      paramsToOptions(params),
    );
  }

  public get(id: number): Observable<TradingCode> {
    return this.http.get<TradingCode>(`/api/bidcode/${id}`);
  }

  public getAll(
    params: Record<string, string> | number | null = {},
  ): Observable<AllBidCodes[]> {
    return this.http.get<AllBidCodes[]>(
      `/api/bidcode/all`,
      paramsToOptions(params),
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bidcode/${id}`);
  }

  public restore(id: number): Observable<TradingCode> {
    return this.http.patch<TradingCode>(`/api/bidcode/${id}`, {});
  }

  public save(
    bidcode: Partial<TradingCode>,
    id: number,
  ): Observable<TradingCode> {
    return this.http.put<TradingCode>(`/api/bidcode/${id}`, removeID(bidcode));
  }

  public create(bidcode: Partial<TradingCode>): Observable<TradingCode> {
    return this.http.post<TradingCode>('/api/bidcode', bidcode);
  }

  public createTa$k(): Observable<{ task_id: number; status: string }> {
    return this.http.get<{ task_id: number; status: string }>(
      '/api/bidcode/all/download',
    );
  }
}
