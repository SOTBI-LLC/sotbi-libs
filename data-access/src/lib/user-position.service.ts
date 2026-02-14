import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { UserPosition } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserPositionService {
  public readonly http = inject(HttpClient);

  public readonly path = '/api/user-position';

  public batchUpdate(items: UserPosition[]): Observable<UserPosition[]> {
    return this.http.put<UserPosition[]>(`${this.path}s`, items);
  }
}
