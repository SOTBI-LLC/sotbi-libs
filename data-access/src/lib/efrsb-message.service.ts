import type { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Message } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class EfrsbMessageService extends CommonService<Message> {
  protected override readonly http: HttpClient;

  public override readonly path = '/api/message';
  constructor() {
    const http = inject(HttpClient);

    super(http);
    this.http = http;
  }

  public getAllMessages(
    params: HttpParams,
  ): Observable<{ requests: Message[]; count: number }> {
    return this.http.get<{ requests: Message[]; count: number }>(
      `${this.path}s`,
      {
        params,
      },
    );
  }

  public getPublicationsBySubMessageIdAndDebtorId(
    subMessageId: number,
    debtorId: number,
  ): Observable<number[]> {
    return this.http.get<number[]>(`${this.path}s/${subMessageId}/${debtorId}`);
  }

  public getMessageByPublicationNum(
    publicationNum: number,
  ): Observable<Message> {
    return this.http.get<Message>(`${this.path}?num=${publicationNum}`);
  }

  public getPreviousLots(debtorId: number): Observable<Partial<Message>[]> {
    return this.http.get<Partial<Message>[]>(
      `${this.path}s/previous_lots/${debtorId}`,
    );
  }
}
