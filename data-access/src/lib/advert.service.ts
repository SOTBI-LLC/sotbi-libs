import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Advert, Progress } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

/* global Promise */

@Injectable({
  providedIn: 'root',
})
export class AdvertService extends CommonService<Advert> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/adverts';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithParams(
    week: number,
    year: number,
  ): Observable<{ adverts: Advert[]; count: number }> {
    if (week > 0) {
      return this.http.get<{ adverts: Advert[]; count: number }>(
        `${this.path}?week=${week}.${year}`,
      );
    } else {
      return this.http.get<{ adverts: Advert[]; count: number }>(
        `${this.path}/old`,
      );
    }
  }

  public getOldCount(): Observable<number> {
    return this.http.get<number>(`${this.path}/old/count`);
  }

  public search(
    phrase: string,
    page = 0,
  ): Observable<{ adverts: Advert[]; count: number }> {
    return this.http.get<{ adverts: Advert[]; count: number }>(
      `${this.path}?search=${phrase}&page=${page}`,
    );
  }

  public getProgress(id: number): Observable<Progress> {
    return this.http.get<Progress>(`${this.path}/${id}/progress`);
  }

  public restore(id: number): Observable<Advert> {
    return this.http.patch<Advert>(`${this.path}/${id}`, null);
  }
}
