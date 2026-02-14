import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Position } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private http = inject(HttpClient);

  public getAll(limit: number): Observable<Position[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit + '');
    }
    return this.http.get<Position[]>('/api/positions', { params });
  }

  public get(id: number): Observable<Position> {
    return this.http.get<Position>(`/api/position/${id}`);
  }

  public create(item: Partial<Position>): Observable<Position> {
    return this.http.post<Position>('/api/position', item);
  }

  public update(item: Partial<Position>): Observable<Position> {
    const position = structuredClone(item);
    const { id } = item;
    delete position.user_group;
    delete position.updated;
    return this.http.put<Position>(`/api/position/${id}`, removeID(position));
  }

  public delete(id: number): Observable<Position> {
    return this.http.delete<Position>(`/api/position/${id}`);
  }

  public batchUpdate(items: Position[]): Observable<Position[]> {
    let positions = structuredClone(items);
    positions = positions.map((el) => {
      el.updated = null;
      el.user_group = null;
      return el;
    });
    return this.http.put<Position[]>('/api/positions', positions);
  }
}
