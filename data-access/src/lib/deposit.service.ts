import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Deposit } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepositService {
  private readonly http = inject(HttpClient);
  protected readonly path = '/api/deposit';

  public getAll(): Observable<Deposit[]> {
    return this.http.get<Deposit[]>(`${this.path}s`);
  }

  public save(id: number, item: Partial<Deposit>): Observable<Deposit> {
    return this.http.put<Deposit>(`${this.path}/${id}`, item);
  }

  public get(id: number): Observable<Deposit> {
    return this.http.get<Deposit>(`${this.path}/${id}`);
  }

  public create(item: Partial<Deposit>): Observable<Deposit> {
    return this.http.post<Deposit>(this.path, item);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
}
