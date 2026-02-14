import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  Staff,
  StaffAndChronicle,
  StaffChart,
  StaffFlat,
  StaffsHistory,
  StaffUnit,
} from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import { firstValueFrom, type Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private http = inject(HttpClient);

  public getAll$(
    params: Record<string, string | number | boolean> = {},
  ): Observable<Staff[]> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<Staff[]>('/api/staffs', options);
  }

  public getRPG$(): Observable<Staff[]> {
    return this.http.get<Staff[]>('/api/staffs/groups');
  }

  public getAll(
    params: Record<string, string | number | boolean> = {},
  ): Promise<Staff[]> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return firstValueFrom(this.http.get<Staff[]>('/api/staffs', options));
  }

  public getTree(): Observable<Staff[]> {
    return this.http.get<Staff[]>('/api/staffs/tree');
  }

  public getSubTree(id: number): Observable<Staff[]> {
    return this.http.get<Staff[]>(`/api/staffs/tree/${id}`);
  }

  public get(id: number): Promise<Staff> {
    return firstValueFrom(this.http.get<Staff>(`/api/staff/${id}`));
  }

  public get$(id: number): Observable<Staff> {
    return this.http.get<Staff>(`/api/staff/${id}`);
  }

  public getUnit$(
    params: Record<string, string | number | boolean> = {},
  ): Observable<StaffUnit[]> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<StaffUnit[]>('/api/staffs/units', options);
  }

  /**
   * Получить историю изменения позиции в структуре компании
   */
  public getHistory(id: number): Observable<StaffsHistory[]> {
    return this.http.get<StaffsHistory[]>(`/api/staff/${id}/history`);
  }

  public create(item: Partial<Staff>): Observable<Staff> {
    return this.http.post<Staff>('/api/staff', removeID(item));
  }

  public save(id: number, item: Partial<Staff>): Promise<Staff> {
    return firstValueFrom(this.http.put<Staff>(`/api/staff/${id}`, item));
  }

  public save$(item: Partial<Staff>): Observable<Staff> {
    const { id } = item;
    return this.http.put<Staff>(`/api/staff/${id}`, removeID(item));
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/staff/${id}`);
  }

  public getTreeChart(
    fired = false,
    expandedAll = false,
  ): Observable<StaffChart[]> {
    let params = new HttpParams();
    if (fired) {
      params = params.set('fired', 'true');
    }
    if (expandedAll) {
      params = params.set('expandedAll', 'true');
    }
    return this.http.get<StaffChart[]>(`api/staffs/tree/chart`, { params });
  }

  public getSortUnits(): Observable<StaffFlat[]> {
    return this.http.get<StaffFlat[]>('/api/staffs/flat');
  }

  public getName(name: string): Observable<Staff> {
    return this.http.get<Staff>(`/api/staff/${name}/check-name`);
  }

  public getStaffsAndChronicles(id: number): Observable<StaffAndChronicle> {
    return this.http.get<StaffAndChronicle>(`/api/staff/${id}/check-id`);
  }
}
