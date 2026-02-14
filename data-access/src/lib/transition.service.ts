import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { RequestTypeEnum, Transition } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class TransitionService extends CommonService<Transition> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/transition';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public show(type: string): Observable<{ data: string }> {
    return this.http.get<{ data: string }>(`${this.path}s/${type}/show`);
  }
  public allByName(type: RequestTypeEnum): Observable<Transition[]> {
    return this.http.get<Transition[]>(`${this.path}s/${type}`);
  }
}
