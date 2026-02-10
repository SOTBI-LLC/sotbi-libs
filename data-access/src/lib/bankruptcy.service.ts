import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Bankruptcy } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BankruptcyService {
  private http = inject(HttpClient);

  public getAll(
    params: Record<string, string> | number | null = {},
  ): Observable<Bankruptcy[]> {
    const options = { params: new HttpParams() };
    if (params && typeof params === 'object') {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<Bankruptcy[]>('/api/bankruptcies', options);
  }

  public get(id: number): Observable<Bankruptcy> {
    return this.http.get<Bankruptcy>(`/api/bankruptcy/${id}`);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bankruptcy/${id}`);
  }

  public save(
    bankruptcy: Partial<Bankruptcy>,
    id: number,
  ): Observable<Bankruptcy> {
    return this.http.put<Bankruptcy>(`/api/bankruptcy/${id}`, bankruptcy);
  }

  public create(bankruptcy: Partial<Bankruptcy>): Observable<Bankruptcy> {
    return this.http.post<Bankruptcy>('/api/bankruptcy', bankruptcy);
  }
}
