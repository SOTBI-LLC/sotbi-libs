import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Calcs, Calculation } from '@sotbi/models';
import type { Observable } from 'rxjs';

export interface DebtCalcsGetAllModel {
  debtors: Calcs[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CalculationService {
  private http = inject(HttpClient);

  public getAll(
    id: number,
    params: { [prop: string]: string | number } = {},
  ): Observable<DebtCalcsGetAllModel> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<{ debtors: Calcs[]; count: number }>(
      `/api/organizers/${id}`,
      options,
    );
  }

  public getInitiators(): Observable<Calcs[]> {
    return this.http.get<Calcs[]>('/api/organizers');
  }

  public get(iid: number, id: number): Observable<Calcs> {
    return this.http.get<Calcs>(`/api/organizer/${iid}/debtor/${id}`);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/bidcodes/calculation/${id}`);
  }

  public save(
    calcs: Partial<Calculation>,
    id: number,
  ): Observable<Calculation> {
    return this.http.put<Calculation>(`/api/bidcodes/calculation/${id}`, calcs);
  }

  public create(
    calcs: Partial<Calculation>,
    id: number,
  ): Observable<Calculation> {
    return this.http.post<Calculation>(
      `/api/bidcodes/${id}/calculation`,
      calcs,
    );
  }
}
