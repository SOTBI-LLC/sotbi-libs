import { HttpClient } from '@angular/common/http';
import type { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { CatalogAppraiser, SaveAppraiserRequest } from '@sotbi/models';

@Injectable({ providedIn: 'root' })
export class AppraiserService {
  private readonly http = inject(HttpClient);

  public getAll(context?: HttpContext) {
    return this.http.get<CatalogAppraiser[]>('/api/appraisers', { context });
  }

  public create(item: SaveAppraiserRequest, context?: HttpContext) {
    return this.http.post<CatalogAppraiser>('/api/appraiser', item, {
      context,
    });
  }

  public save(item: SaveAppraiserRequest, id: number, context?: HttpContext) {
    return this.http.put<CatalogAppraiser>(`/api/appraiser/${id}`, item, {
      context,
    });
  }

  public delete(id: number, context?: HttpContext) {
    return this.http.delete<void>(`/api/appraiser/${id}`, { context });
  }
}
