import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { SimpleEdit2Model } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaffTypeService {
  private http = inject(HttpClient);

  public getAll(limit = 0): Observable<SimpleEdit2Model[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit + '');
    }
    return this.http.get<SimpleEdit2Model[]>('/api/stafftypes', { params });
  }

  public get(id: number): Observable<SimpleEdit2Model> {
    return this.http.get<SimpleEdit2Model>(`/api/stafftype/${id}`);
  }

  public create(item: Partial<SimpleEdit2Model>): Observable<SimpleEdit2Model> {
    return this.http.post<SimpleEdit2Model>('/api/stafftype', item);
  }

  public update(item: Partial<SimpleEdit2Model>): Observable<SimpleEdit2Model> {
    const { id } = item;
    return this.http.put<SimpleEdit2Model>(
      `/api/stafftype/${id}`,
      removeID(item),
    );
  }

  public delete(id: number): Observable<SimpleEdit2Model> {
    return this.http.delete<SimpleEdit2Model>(`/api/stafftype/${id}`);
  }
}
