import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { PaymentDocument } from '@sotbi/models';
import { firstValueFrom, type Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService extends CommonService<PaymentDocument> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/payment';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getItem(id: number): Observable<PaymentDocument> {
    return this.http.get<PaymentDocument>(`${this.path}/${id}`);
  }

  public getAllWithParams(
    params: HttpParams,
  ): Observable<{ payments: PaymentDocument[]; count: number }> {
    return this.http.get<{ payments: PaymentDocument[]; count: number }>(
      `${this.path}s`,
      {
        params,
      },
    );
  }

  public getDebtorsPayments(
    params: HttpParams,
  ): Observable<{ payments: PaymentDocument[]; count: number }> {
    return this.http.get<{ payments: PaymentDocument[]; count: number }>(
      '/api/payments/debtor',
      {
        params,
      },
    );
  }

  public create(item: Partial<PaymentDocument>): Promise<PaymentDocument> {
    return firstValueFrom(
      this.http.post<PaymentDocument>(`/api/payment`, item),
    );
  }
}
