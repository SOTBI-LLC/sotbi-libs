import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { EgrnRequest } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class EgrnRequestService extends CommonService<EgrnRequest> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/egrn-request';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithSearch(
    params: HttpParams,
  ): Observable<{ requests: EgrnRequest[]; count: number }> {
    return this.http.get<{ requests: EgrnRequest[]; count: number }>(
      `${this.path}s`,
      { params },
    );
  }

  public getall(
    params: HttpParams,
    view: boolean,
  ): Observable<{ requests: EgrnRequest[]; count: number }> {
    const options = { params: params ? params : new HttpParams() };
    if (view) {
      options.params = options.params.set('view', 'request');
    }
    return this.http.get<{ requests: EgrnRequest[]; count: number }>(
      `${this.path}s`,
      options,
    );
  }

  public batchUpdate(items: EgrnRequest[]): Observable<EgrnRequest[]> {
    return this.http.put<EgrnRequest[]>(this.path, items);
  }

  /**
   * Проверка уникальности № запроса
   * @param {number} num
   * @returns {Observable<Project>}
   */
  public getNum(num: string): Observable<EgrnRequest> {
    return this.http.get<EgrnRequest>(
      `${this.path}/check-num/?num=${encodeURIComponent(num)}`,
    );
  }
}
