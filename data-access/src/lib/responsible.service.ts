import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Responsible } from '@sotbi/models';
import type { Observable } from 'rxjs';

/**
 * ResponsibleService class
 */
@Injectable({
  providedIn: 'root',
})
export class ResponsibleService {
  private http = inject(HttpClient);

  /**
   * Method foe getting all responsibles
   */
  public getAll(): Observable<Responsible[]> {
    return this.http.get<Responsible[]>('/api/responsibles');
  }

  /**
   * Method for update responsible
   */
  public save(item: Responsible): Observable<Responsible> {
    return this.http.put<Responsible>(`/api/responsible/${item.id}`, {
      id: item.id,
      userId: item.userId,
    });
  }

  /**
   * Create responsible
   */
  public create(userId: number): Observable<Responsible> {
    return this.http.post<Responsible>(`/api/responsible`, { userId });
  }
}
