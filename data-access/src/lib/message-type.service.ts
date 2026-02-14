import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { MessageType } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class MessageTypeService extends CommonService<MessageType> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/message-type';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
