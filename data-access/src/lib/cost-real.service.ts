import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CostReal,
  CostRealAnalyticsMonth,
  CostRealFilter,
  ResponseCostMonitoring,
} from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Interval } from 'date-fns';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CostRealService {
  private readonly http = inject(HttpClient);

  /**
   * Получаем все реальные трудозатраты текущего пользователя за указанный период.
   */
  public getRealCosts(filter: CostRealFilter): Observable<CostReal[]> {
    const { start, end } = filter.period;
    let params = new HttpParams();
    params = params.set('start', formatDate(start, 'yyyy-MM-dd', 'ru-RU'));
    params = params.set('end', formatDate(end, 'yyyy-MM-dd', 'ru-RU'));
    return this.http.get<CostReal[]>('/api/v1/costs', { params });
  }

  /**
   * Получаем качество заполнения трудозатрат
   */
  public getMonitoring(interval: Interval): Observable<ResponseCostMonitoring> {
    let params = new HttpParams();
    params = params.set(
      'start',
      formatDate(interval.start, 'yyyy-MM-dd', 'ru-RU'),
    );
    params = params.set('end', formatDate(interval.end, 'yyyy-MM-dd', 'ru-RU'));
    return this.http.get<ResponseCostMonitoring>('/api/v1/cost/monitoring', {
      params,
    });
  }

  /**
   * Получаем все реальные трудозатраты указанных
   * пользователей за указанный период.
   */
  public getSubordinatesCosts(filter: CostRealFilter): Observable<CostReal[]> {
    const { start, end } = filter.period;
    let params = new HttpParams();
    params = params.set('start', formatDate(start, 'yyyy-MM-dd', 'ru-RU'));
    params = params.set('end', formatDate(end, 'yyyy-MM-dd', 'ru-RU'));
    return this.http.get<CostReal[]>('/api/v1/costs/slave', { params });
  }

  /**
   * Записать новый пункт трудозатрат
   */
  public createCostReal(cost: Partial<CostReal>): Observable<CostReal> {
    return this.http.post<CostReal>(`/api/v1/cost`, cost);
  }

  /**
   * Обновить данные по трудозатате
   */
  public updateCostReal(cost: Partial<CostReal>): Observable<CostReal> {
    const { id } = cost;
    const c = structuredClone(cost);
    delete c.debtor;
    delete c.user;
    delete c.work_category;
    return this.http.put<CostReal>(`/api/v1/cost/${id}`, removeID(c));
  }

  /**
   * Удалить указанную трудозатрату
   */
  public deleteCostReal(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/cost/${id}`);
  }

  /**
   * Обновляем все измененные трудозатраты одним запросом
   */
  public batchUpdate(costs: CostReal[]): Observable<CostReal[]> {
    let c = structuredClone(costs);
    c = c.map((el: CostReal) => {
      delete el.debtor;
      delete el.user;
      delete el.work_category;
      return el;
    });
    return this.http.put<CostReal[]>(`/api/v1/costs`, c);
  }

  public getAnalytics(period: Interval) {
    const { start, end } = period;
    let params = new HttpParams();
    params = params.set('start', formatDate(start, 'yyyy-MM-dd', 'ru-RU'));
    params = params.set('end', formatDate(end, 'yyyy-MM-dd', 'ru-RU'));
    return this.http.get<CostRealAnalyticsMonth[]>(`api/v1/cost/analytics`, {
      params,
    });
  }
}
