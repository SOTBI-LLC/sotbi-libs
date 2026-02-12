import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { HelpFile } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class HelpFileService extends CommonService<HelpFile> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/help-file';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
