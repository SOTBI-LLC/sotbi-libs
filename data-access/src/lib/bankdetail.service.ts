import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { ActualAccount, BankDetail } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BankDetailService {
  private http = inject(HttpClient);

  protected readonly path = '/api/bankdetail';

  public getAll(): Observable<BankDetail[]> {
    return this.http.get<BankDetail[]>(`${this.path}s`);
  }
  public getLast(): Observable<ActualAccount[]> {
    return this.http.get<ActualAccount[]>(`${this.path}s/last`);
  }

  public get(id: number, params?: HttpParams): Observable<BankDetail> {
    return this.http.get<BankDetail>(`${this.path}/${id}`, { params });
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }

  public save(item: Partial<BankDetail>, id: number): Observable<BankDetail> {
    return this.http.put<BankDetail>(`${this.path}/${id}`, item);
  }

  public create(item: Partial<BankDetail>): Observable<BankDetail> {
    return this.http.post<BankDetail>(`${this.path}`, item);
  }

  public getStatements(id: number): Observable<BankDetail> {
    return this.http.get<BankDetail>(`${this.path}s/${id}/check-statements`);
  }
}
