import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  BaseCriteria,
  PerformanceCriteria,
  PerformancePeriod,
  UserPercentage,
  UserPercentageRequest,
} from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class PerformancePeriodService extends CommonService<PerformancePeriod> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/motivation/periods';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}

@Injectable({
  providedIn: 'root',
})
export class BaseCriteriaService extends CommonService<BaseCriteria> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/motivation/base_criteria';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PerformanceCriteriaService extends CommonService<PerformanceCriteria> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/motivation/criteria';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
}
@Injectable({
  providedIn: 'root',
})
export class UserPercentageService extends CommonService<UserPercentage> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/motivation/percentage';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getPercentage(
    request: UserPercentageRequest,
  ): Observable<UserPercentage> {
    const queryParams = new HttpParams();
    queryParams.set('user_id', request.user_id.toString());
    queryParams.set('year', request.year.toString());
    queryParams.set('month', request.month.toString());
    return this.http.get<UserPercentage>(this.path, {
      params: queryParams,
    });
  }
}
