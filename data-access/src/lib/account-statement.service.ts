import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AccountStatement } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class AccountStatementService extends CommonService<AccountStatement> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/accountstatements';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithParams(
    params: HttpParams,
  ): Observable<{ requests: AccountStatement[]; count: number }> {
    return this.http.get<{ requests: AccountStatement[]; count: number }>(
      this.path,
      { params },
    );
  }
}
