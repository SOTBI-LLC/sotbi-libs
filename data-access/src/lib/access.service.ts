import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Access } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class AccessService extends CommonService<Access> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/access' as const;

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  /**
   * get list of resources with access mask
   */
  public override GetAll(): Observable<Access[]> {
    return this.http.get<Access[]>('/api/access');
  }

  public getAccess(): Observable<string> {
    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    return this.http.get('/api/access/my', { headers, responseType: 'text' });
  }

  public getAllSrv(): Observable<string[][]> {
    return this.http.get<string[][]>('/api/access/server');
  }

  public createSrv(update: string[]): Observable<string[][]> {
    return this.http.post<string[][]>('/api/access/server', update);
  }

  public updateSrv(update: {
    old: string[][];
    new: string[][];
  }): Observable<string[][]> {
    return this.http.patch<string[][]>('/api/access/server', update);
  }
}
