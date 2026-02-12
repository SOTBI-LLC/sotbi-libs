import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Initiator } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class InitiatorService extends CommonService<Initiator> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/initiator';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
