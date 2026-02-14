import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { PaymentRequest } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentRequestService extends CommonService<PaymentRequest> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/payment-request';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithParams(
    params?: HttpParams,
  ): Observable<{ requests: PaymentRequest[]; count: number }> {
    return this.http.get<{ requests: PaymentRequest[]; count: number }>(
      `${this.path}s`,
      {
        params,
      },
    );
  }
}
