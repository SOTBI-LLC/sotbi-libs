import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Defrayment } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class DefraymentService extends CommonService<Defrayment> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/defrayment';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
