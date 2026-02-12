import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { InsuranceCompany } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InsuranceCompanyService {
  private readonly http = inject(HttpClient);

  protected readonly path = '/api/insurance-company';

  public getAll(): Observable<InsuranceCompany[]> {
    return this.http.get<InsuranceCompany[]>('/api/insurance-companies');
  }

  public get(id: number): Observable<InsuranceCompany> {
    return this.http.get<InsuranceCompany>(`${this.path}/${id}`);
  }

  public create(item: Partial<InsuranceCompany>): Observable<InsuranceCompany> {
    return this.http.post<InsuranceCompany>(this.path, item);
  }

  public update(item: Partial<InsuranceCompany>): Observable<InsuranceCompany> {
    const { id } = item;
    return this.http.put<InsuranceCompany>(
      `${this.path}/${id}`,
      removeID(item),
    );
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
}
