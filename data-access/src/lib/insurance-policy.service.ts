import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { InsurancePolicy } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class InsurancePolicyService extends CommonService<InsurancePolicy> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/insurance-policy';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public override GetAll(): Observable<InsurancePolicy[]> {
    return this.http.get<InsurancePolicy[]>('/api/insurance-policies');
  }
}
