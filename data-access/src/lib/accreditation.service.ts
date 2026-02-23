import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Accreditation } from '@sotbi/models';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class AccreditationService extends CommonService<Accreditation> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/accreditations';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
