import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { UserGroup } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsergroupService {
  private http = inject(HttpClient);

  public create(item: Partial<UserGroup>): Observable<UserGroup> {
    return this.http.post<UserGroup>('/api/usergroup', item);
  }
  /**
   * get list of resources with access mask
   */
  public getAll(): Observable<UserGroup[]> {
    return this.http.get<UserGroup[]>('/api/usergroup');
  }

  public get(id: number): Observable<UserGroup> {
    return this.http.get<UserGroup>(`/api/usergroup/${id}`);
  }

  public update(item: Partial<UserGroup>): Observable<UserGroup> {
    const { id } = item;
    delete item.id;
    return this.http.put<UserGroup>(`/api/usergroup/${id}`, item);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/usergroup/${id}`);
  }
}
