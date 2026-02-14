import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { WorkCategory } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkCategoryService {
  private http = inject(HttpClient);

  /** -1 = получаем данные для списка 'Категории работ' в админке
   *
   * 0 = без limit параметра = получаем данные для колонки 'Категория работы' в Трудозатратах
   */
  public getAll(limit = 0): Observable<WorkCategory[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit + '');
    }
    return this.http.get<WorkCategory[]>('/api/workcategories', { params });
  }

  public get(id: number): Observable<WorkCategory> {
    return this.http.get<WorkCategory>(`/api/workcategory/${id}`);
  }

  public create(item: Partial<WorkCategory>): Observable<WorkCategory> {
    return this.http.post<WorkCategory>('/api/workcategory', item);
  }

  public update(item: Partial<WorkCategory>): Observable<WorkCategory> {
    const { id } = item;
    const workcategory = structuredClone(item);
    delete workcategory.staff;
    return this.http.put<WorkCategory>(
      `/api/workcategory/${id}`,
      removeID(workcategory),
    );
  }

  public delete(id: number): Observable<WorkCategory> {
    return this.http.delete<WorkCategory>(`/api/workcategory/${id}`);
  }

  public batchUpdate(costs: WorkCategory[]): Observable<WorkCategory[]> {
    let c = structuredClone(costs);
    c = c.map((el) => {
      delete el.staff;
      return el;
    });
    return this.http.put<WorkCategory[]>('/api/workcategories', c);
  }
}
