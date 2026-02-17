import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { SimpleEdit2Model } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

export enum SimpleEdit2ServiceNames {
  ADVERT = 'adverttype', //   Виды объявлений
  CATEGORY = 'category', //   Категории
  FLOW = 'flowtype', //       Денежные потоки
  PROCEDURE = 'procedure', // Процедуры
}

export const simpleEdit2ServiceNamesArr: string[] = Object.values(
  SimpleEdit2ServiceNames,
);

/**
 * Second Sefvice for edit some types
 */
@Injectable({
  providedIn: 'root',
})
export class SimpleEdit2Service {
  private http = inject(HttpClient);

  private defaultServiceName = SimpleEdit2ServiceNames.ADVERT;

  /**
   * Get all items for dictionary
   */
  public getAll(
    type: string = this.defaultServiceName,
  ): Observable<SimpleEdit2Model[]> {
    return this.http.get<SimpleEdit2Model[]>(`/api/${type}s`);
  }

  /**
   * Save/Update item in dictionary
   */
  public save(
    id: number,
    item: Partial<SimpleEdit2Model>,
    type: string = this.defaultServiceName,
  ): Observable<SimpleEdit2Model> {
    return this.http.put<SimpleEdit2Model>(
      `/api/${type}/${id}`,
      removeID(item),
    );
  }

  /**
   * Create item
   */
  public create(
    item: Partial<SimpleEdit2Model>,
    type: string = this.defaultServiceName,
  ): Observable<SimpleEdit2Model> {
    return this.http.post<SimpleEdit2Model>(`/api/${type}`, item);
  }

  /**
   * Delete item
   */
  public delete(
    id: number,
    type: string = this.defaultServiceName,
  ): Observable<void> {
    return this.http.delete<void>(`/api/${type}/${id}`);
  }
  /**
   * Restore deleted item
   */
  public restore(
    id: number,
    type: string = this.defaultServiceName,
  ): Observable<SimpleEdit2Model> {
    //TODO: check what method use for restore
    return this.http.delete<SimpleEdit2Model>(`/api/${type}/${id}`);
  }
}
