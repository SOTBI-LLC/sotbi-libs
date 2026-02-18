import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Project } from '@sotbi/models';
import type { Observable } from 'rxjs';

/**
 * ProjectService - class for work with Project items
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  protected readonly path = '/api/project';

  /**
   * Get list of all projects
   */
  public getAll(month: Date | null = null): Observable<Project[]> {
    let url = '/api/projects';
    if (month) {
      const monthText = formatDate(month, 'yyyy-MM', 'ru-Ru');
      url += `/?month=${monthText}`;
    }
    return this.http.get<Project[]>(url);
  }

  public getAllShort(): Observable<Project[]> {
    let url = '/api/projects';
    url += `/?short=1`;
    return this.http.get<Project[]>(url);
  }

  public getUsed(month: Date, userId: number): Observable<number[]> {
    const monthText = formatDate(month, 'yyyy-MM', 'ru-Ru');
    return this.http.get<number[]>(`/api/projects/${monthText}/${userId}/used`);
  }

  public getAll$(
    params: Record<string, string | number | boolean> = {},
  ): Observable<Project[]> {
    const options = { params: new HttpParams() };
    if (params) {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<Project[]>(`${this.path}s`, options);
  }

  /**
   * Get concrete Project by ID
   */
  public get(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.path}/${id}`);
  }

  public delete(id: number): Observable<Project> {
    return this.http.delete<Project>(`${this.path}/${id}`);
  }

  /**
   * Create new Project
   */
  public create(item: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.path, item);
  }

  /**
   * Save/Update Project
   */
  public save(id: number, item: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.path}/${id}`, item);
  }

  /**
   * Проверка наличия торгов по данному проекту
   * @param {number} id
   * @returns {Observable<Project>}
   */
  public getBidding(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.path}/${id}/check-biddings`);
  }

  /**
   * Проверка наличия имени проекта
   * @param {string} name
   * @returns {Observable<Project>}
   */
  public checkName(name: string): Observable<Project> {
    return this.http.get<Project>(`${this.path}/${name}/check-name`);
  }
}
