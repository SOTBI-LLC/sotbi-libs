import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { RequestType } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class RequestTypeService extends CommonService<RequestType> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/requesttype';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
