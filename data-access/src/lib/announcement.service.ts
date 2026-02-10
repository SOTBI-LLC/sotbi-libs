import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Announcement } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService extends CommonService<Announcement> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/announcement';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllWithCondition(
    all = false,
    show_planned = false,
    omit_img = false,
  ): Observable<Announcement[]> {
    let params = new HttpParams();
    if (all) {
      params = params.set('all', '1');
    }
    if (show_planned) {
      params = params.set('show_planned', '1');
    }
    if (omit_img) {
      params = params.set('omit_img', '1');
    }
    return this.http.get<Announcement[]>(`${this.path}s`, { params });
  }
}
