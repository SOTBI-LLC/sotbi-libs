import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Debtor, DebtorsList } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class DebtorService extends CommonService<Debtor> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/debtors';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithParams(
    params: HttpParams,
  ): Observable<{ debtors: DebtorsList[]; count: number }> {
    return this.http.get<{ debtors: DebtorsList[]; count: number }>(this.path, {
      params,
    });
  }

  // https://ourzoo.ru/browse/BH-766
  public getList(params: HttpParams): Observable<Debtor[]> {
    return this.http.get<Debtor[]>(`${this.path}/list`, { params });
  }

  public getListWithBankDetail$(): Observable<Debtor[]> {
    return this.http.get<Debtor[]>(`${this.path}/bank_details`);
  }
  public getDebtorsByBankruptcy(id: number): Observable<Debtor[]> {
    return this.http.get<Debtor[]>(`${this.path}/bankruptcy/${id}`);
  }

  public getListAsProject(): Observable<Debtor[]> {
    return this.getList(new HttpParams().set('asproject', 'true'));
  }

  public getDebtorsShort(): Observable<Debtor[]> {
    return this.getList(new HttpParams().set('short', 'true'));
  }

  public restore(id: number): Observable<Debtor> {
    return this.http.patch<Debtor>(`${this.path}/${id}`, {});
  }

  public checkInn(inn: string): Observable<number[]> {
    return this.http.get<number[]>(`/api/debtors/inn/${inn}`);
  }
}
