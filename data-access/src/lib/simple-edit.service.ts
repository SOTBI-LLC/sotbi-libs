import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { SimpleEditModel } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

export enum SimpleEditServiceNames {
  ATTACHMENT = 'attachmenttype', // Виды вложений
  ASSET = 'assettype', //           Виды имущества
  LINK = 'linktype', //             Тип ссылки
  PERSON = 'persontype', //         Представляемые лица
  STAGE = 'stage', //               Стадии
  TARGET = 'targettype', //         Поставленные цели
  CLIENT = 'client', //             Типы клиентов
  PROFIT_CAT = 'profitcat', //      Категории прибыльности
  ACCOUNTTYPE = 'accounttype', //   Виды счетов
}

export const simpleEditServiceNamesArr: string[] = Object.values(
  SimpleEditServiceNames,
);

/**
 * Sefvice for edit some types
 */
@Injectable({
  providedIn: 'root',
})
export class SimpleEditService {
  private http = inject(HttpClient);

  public defaultServiceName = SimpleEditServiceNames.ATTACHMENT;

  /**
   * Get all items for dictionary
   */
  public getAll(
    type: string = this.defaultServiceName,
  ): Observable<SimpleEditModel[]> {
    return this.http.get<SimpleEditModel[]>(`/api/${type}s`);
  }

  public get(
    type: string = this.defaultServiceName,
    id: number,
  ): Observable<SimpleEditModel> {
    return this.http.get<SimpleEditModel>(`/api/${type}s/${id}`);
  }

  /**
   * Save/Update item in dictionary
   */
  public save(
    simpleEdit: SimpleEditModel,
    type: string = this.defaultServiceName,
  ): Promise<SimpleEditModel> {
    return firstValueFrom(
      this.http.put<SimpleEditModel>(`/api/${type}/${simpleEdit.id}`, {
        name: simpleEdit.name,
      }),
    );
  }

  public save$(
    simpleEdit: Partial<SimpleEditModel>,
    type: string = this.defaultServiceName,
  ): Observable<SimpleEditModel> {
    return this.http.put<SimpleEditModel>(`/api/${type}/${simpleEdit.id}`, {
      name: simpleEdit.name,
    });
  }

  /**
   * Create item
   */
  public create(
    name: string,
    type: string = this.defaultServiceName,
  ): Observable<SimpleEditModel> {
    return this.http.post<SimpleEditModel>(`/api/${type}`, { name });
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
   * Restore delete item
   */
  public restore(
    id: number,
    type: string = this.defaultServiceName,
  ): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/${type}/${id}`));
  }
}
