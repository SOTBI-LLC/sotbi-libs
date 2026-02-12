import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Dadata } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DadataService {
  private readonly http = inject(HttpClient);

  public getDataByInn(inn: string): Observable<Dadata[]> {
    let params = new HttpParams();
    if (inn) {
      params = params.set('inn', inn);
    }
    return this.http.get<Dadata[]>(`/api/suggestions`, { params });
  }
}
