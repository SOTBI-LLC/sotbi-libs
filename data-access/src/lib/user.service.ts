import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CostRealFilter,
  HeadDepartment,
  HeadDepartmentChef,
  User,
  UserShort,
} from '@sotbi/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  public readonly path = '/api/user';

  public getAll(
    pos: Array<number> = [],
    excl: Array<number> = [],
    fired = false
  ): Observable<User[]> {
    let params = new HttpParams();
    if (fired) {
      params = params.set('fired', '1');
    }
    if (pos.length > 0) {
      for (const p of pos) {
        params = params.append('pos', p + '');
      }
    } else if (excl.length > 0) {
      for (const ex of excl) {
        params = params.append('excl', ex + '');
      }
    }
    return this.http.get<User[]>(`${this.path}s`, { params });
  }

  public get(id: number): Observable<User> {
    return this.http.get<User>(`${this.path}/${id}`);
  }

  public getMe(): Observable<User> {
    return this.http.get<User>(`${this.path}/me`);
  }

  public getName(name: string): Observable<User> {
    return this.http.get<User>(`${this.path}/check/${name}`);
  }

  public getEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.path}/check-email/${email}`);
  }

  public create(user: Partial<User>): Observable<User> {
    user.user = user.user?.trim();
    return this.http.post<User>(this.path, user);
  }

  public save(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.path}/${id}`, user);
  }

  public saveMe(user: Partial<User>): Observable<string> {
    return this.http.put<string>(`${this.path}/me`, user);
  }

  public fire(id: number): Observable<User> {
    const user = { fire: new Date() };
    return this.http.patch<User>(`${this.path}/${id}`, user);
  }

  public getNotEmployed(month: Date): Observable<User[]> {
    const monthText = formatDate(month, 'yyyy-MM', 'ru-Ru');
    return this.http.get<User[]>(`${this.path}s/${monthText}`);
  }

  public getNotFilled(month: Date): Observable<User[]> {
    const monthText = formatDate(month, 'yyyy-MM', 'ru-Ru');
    return this.http.get<User[]>(`${this.path}s/${monthText}`);
  }

  public getSubordinates(filter: CostRealFilter): Observable<User[]> {
    let params = new HttpParams();
    if (filter.units.length > 0) {
      for (const unit of filter.units) {
        params = params.append('units', unit + '');
      }
    }
    if (filter.users.length > 0) {
      for (const user of filter.users) {
        params = params.append('users', user + '');
      }
    }
    return this.http.get<User[]>(`${this.path}s/subordinates`, { params });
  }

  public login(credentials: {
    username: string;
    password: string;
  }): Observable<{ token: string; access?: string; refresh_token?: string }> {
    const params = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);
    return this.http.post<{ token: string; access?: string }>(
      `/api/login`,
      params.toString(),
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }
    );
  }

  /**
   * Update user password, if ok, get User data
   */
  public updatePassword(value: {
    id: number;
    password: string;
    uuid: Uint16Array;
  }): Observable<User> {
    return this.http.post<User>(`/api/update-password`, value);
  }

  public loginAs(id: number): Observable<{ token: string; access?: string }> {
    return this.http.get<{ token: string; access?: string }>(
      `/api/login/${id}`
    );
  }

  /**
   * Check that UUID is not expired
   */
  public CheckUUID({
    id,
    uuid,
  }: {
    id: number;
    uuid: string;
  }): Observable<User> {
    return this.http.get<User>(`/api/check-uuid/${id}/${uuid}`);
  }

  public logout(): Observable<void> {
    return this.http.get<void>('/api/logout');
  }

  /**
   * Send email to server for reset password
   */
  public resetPassword(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`/api/reset-password`, params.toString(), {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    });
  }

  public refreshToken(
    token: string
  ): Observable<{ token: string; access?: string; refresh_token?: string }> {
    return this.http.post<{
      token: string;
      access?: string;
      refresh_token?: string;
    }>(`/api/refresh`, { refresh_token: token });
  }

  public getHeadDepartment(
    id: number
  ): Observable<[HeadDepartmentChef, HeadDepartment]> {
    return this.http.get<[HeadDepartmentChef, HeadDepartment]>(
      `${this.path}s/${id}/head-department`
    );
  }

  public getUsersShort(): Observable<UserShort[]> {
    return this.http.get<UserShort[]>(`${this.path}s/short`);
  }
}
