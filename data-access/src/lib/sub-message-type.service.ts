import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { SubMessageType } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class SubMessageTypeService extends CommonService<SubMessageType> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/sub-message-type';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
