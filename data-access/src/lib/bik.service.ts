import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Bik } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BikService {
  private http = inject(HttpClient);

  public get$(id: string): Observable<Bik> {
    return this.http.get<Bik>(`/api/bik/${id}`);
  }

  public get(id: string): Observable<Bik> {
    return this.http.get<Bik>(`/api/bik/${id}`);
  }

  public remove(id: number): Observable<Bik> {
    return this.http.delete<Bik>(`/api/bik/${id}`);
  }
}
