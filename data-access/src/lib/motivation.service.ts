import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  BaseCriteria,
  PerformanceCriteria,
  PerformanceCriteriaRequest,
  PerformancePeriod,
  UserPercentage,
  UserPercentageRequest,
  UserPerformance,
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

  public getAll(): Observable<{ items: PerformancePeriod[] }> {
    return this.http.get<{ items: PerformancePeriod[] }>(this.path);
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

  public getAll(): Observable<BaseCriteria[]> {
    return this.http.get<BaseCriteria[]>(this.path);
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

  public getAll(
    request: PerformanceCriteriaRequest,
  ): Observable<{ items: PerformanceCriteria[] }> {
    let queryParams = new HttpParams();
    if (request.user_id) {
      queryParams = queryParams.set('user_id', request?.user_id?.toString());
    }
    if (request?.department_id) {
      queryParams = queryParams.set(
        'department_id',
        request?.department_id?.toString(),
      );
    }

    queryParams = queryParams.set('year', request.year.toString());
    queryParams = queryParams.set('month', request.month.toString());
    return this.http.get<{ items: PerformanceCriteria[] }>(this.path, {
      params: queryParams,
    });
  }
}
@Injectable({
  providedIn: 'root',
})
export class UserPerformanceService extends CommonService<UserPerformance> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/motivation/performance';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }
  public upsert(item: UserPerformance): Observable<UserPerformance> {
    return this.http.put<UserPerformance>(this.path, item);
  }

  public getAll(
    request: UserPercentageRequest,
  ): Observable<{ items: UserPerformance[] }> {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('user_id', request.user_id.toString());
    queryParams = queryParams.set('year', request.year.toString());
    queryParams = queryParams.set('month', request.month.toString());
    return this.http.get<{ items: UserPerformance[] }>(this.path, {
      params: queryParams,
    });
  }
}

@Injectable({
  providedIn: 'root',
})
// check: нет стейта
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
    let queryParams = new HttpParams();
    queryParams = queryParams.set('user_id', request.user_id.toString());
    queryParams = queryParams.set('year', request.year.toString());
    queryParams = queryParams.set('month', request.month.toString());
    return this.http.get<UserPercentage>(this.path, {
      params: queryParams,
    });
  }
}
