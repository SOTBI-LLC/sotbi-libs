import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Authz, BankDetail, Counterparty, Employee } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class CounterpartyService extends CommonService<Counterparty> {
  public override readonly http: HttpClient;

  public override readonly path = '/api/counterparties';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public override GetAll(
    params: Record<string, string> | number | null = {},
  ): Observable<Counterparty[]> {
    const options = { params: new HttpParams() };
    if (params && typeof params === 'object') {
      for (const prop in params) {
        if (Object.prototype.hasOwnProperty.call(params, prop)) {
          options.params = options.params.set(prop, params[prop]);
        }
      }
    }
    return this.http.get<Counterparty[]>(this.path, options);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CounterpartyBankDetailService extends CommonService<BankDetail> {
  public override readonly http: HttpClient;

  public override readonly path = '/api/counterparties';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public override GetAll(id: number): Observable<BankDetail[]> {
    return this.http.get<BankDetail[]>(
      `/api/counterparties/${id}/bank_details`,
    );
  }

  public updateAll(
    counterparty_id: number,
    bank_details: Partial<BankDetail>[],
  ): Observable<BankDetail[]> {
    return this.http.put<BankDetail[]>(
      `/api/counterparties/${counterparty_id}/bank_details`,
      {
        bank_details,
      },
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends CommonService<Employee> {
  public override readonly http: HttpClient;

  public override readonly path = '/api/counterparties';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public override GetAll(id: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`/api/counterparties/${id}/employees`);
  }

  public getAllByUserID(uid: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`/api/counterparties/employees/${uid}`);
  }

  public updateAll(
    counterparty_id: number,
    employees: Partial<Employee>[],
  ): Observable<Employee[]> {
    return this.http.put<Employee[]>(
      `/api/counterparties/${counterparty_id}/employees`,
      {
        employees,
      },
    );
  }

  public updateAllByUserID(
    uid: number,
    employees: Partial<Employee>[],
  ): Observable<Employee[]> {
    return this.http.put<Employee[]>(`/api/counterparties/employees/${uid}`, {
      employees,
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class CounterpartyAccessService {
  public readonly http = inject(HttpClient);

  public readonly path = '/api/counterparties/rules';

  public GetAll(): Observable<Authz> {
    return this.http.get<Authz>(this.path);
  }

  public UpdateAll(authz: Authz): Observable<Authz> {
    return this.http.put<Authz>(this.path, authz);
  }
}
