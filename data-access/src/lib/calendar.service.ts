import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Calendar } from '@sotbi/models';
import { firstValueFrom, type Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private http = inject(HttpClient);

  public GetCalendarLast(): Promise<Calendar> {
    return firstValueFrom(this.http.get<Calendar>(`/api/calendar`));
  }

  public GetCalendarLast$(): Observable<Calendar> {
    return this.http.get<Calendar>('/api/calendar');
  }

  public GetCalendarActive(filling = false): Observable<Calendar[]> {
    let params = new HttpParams();
    if (filling) {
      params = params.set('filling', 'true');
    }
    return this.http.get<Calendar[]>('/api/calendar/active', { params });
  }

  /**
   * removePeriod
   */
  public togglePeriod(cal: Calendar): Observable<Calendar[]> {
    const ym = formatDate(cal.first_day_month, 'yyyy-MM', 'ru-Ru');
    const { editable } = cal;
    return this.http.put<Calendar[]>(`/api/calendar/${ym}`, { editable });
  }

  public refreshPeriod(cal: Date): Observable<Calendar> {
    const ym = formatDate(cal, 'yyyy-MM', 'ru-Ru');
    return this.http.get<Calendar>(`/api/calendar/${ym}`);
  }
}
