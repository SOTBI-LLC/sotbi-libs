import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Sro } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SroService {
  private http = inject(HttpClient);

  public getAll(
    params: Record<string, string | number | boolean> = {},
  ): Observable<Sro[]> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<Sro[]>(`/api/sros`, options);
  }

  public get(id: number): Observable<Sro> {
    return this.http.get<Sro>(`/api/sro/${id}`);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/sro/${id}`);
  }

  public save(bidding: Partial<Sro>, id: number): Observable<Sro> {
    return this.http.put<Sro>(`/api/sro/${id}`, removeID(bidding));
  }

  public create(bidding: Partial<Sro>): Observable<Sro> {
    return this.http.post<Sro>('/api/sro', bidding);
  }
}
