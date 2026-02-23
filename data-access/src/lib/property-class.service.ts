import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { PropertyClass } from '@sotbi/models';
import { paramsToOptions } from '@sotbi/utils';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class PropertyClassService extends CommonService<PropertyClass> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/property-class';

  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAll$(
    params: Record<string, string> | number | null = {},
  ): Observable<PropertyClass[]> {
    return this.http.get<PropertyClass[]>(
      '/api/property-classes',
      paramsToOptions(params),
    );
  }

  public get$(id: string): Observable<PropertyClass> {
    return this.http.get<PropertyClass>(`${this.path}/${id}`);
  }

  public delete$(id: string): Observable<void> {
    return this.http.delete<void>(`${this.path}/${id}`);
  }
}
