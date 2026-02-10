import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Arbitration } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class ArbitrationService extends CommonService<Arbitration> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/arbitration';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public override delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }

  public override get(id: string | number): Observable<Arbitration> {
    return this.http.get<Arbitration>(`${this.path}/${id}`);
  }
}
