import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { RealEstate } from '@sotbi/models';
import { removeID } from '@sotbi/utils';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RealEstateService {
  private readonly http = inject(HttpClient);

  protected readonly path = '/api/real-estate';

  public get(id: number): Observable<RealEstate> {
    return this.http.get<RealEstate>(`${this.path}/${id}`);
  }

  public update(item: Partial<RealEstate>): Observable<RealEstate> {
    const { id } = item;
    return this.http.put<RealEstate>(`${this.path}/${id}`, removeID(item));
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
}
