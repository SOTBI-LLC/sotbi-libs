import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TaskListType } from '@sotbi/models';
import type { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskListTypeService {
  private http = inject(HttpClient);

  public getAll(): Observable<TaskListType[]> {
    return this.http.get<TaskListType[]>(`/api/tasklisttypes`);
  }

  public create(tlt: Partial<TaskListType>): Observable<TaskListType> {
    return this.http.post<TaskListType>(`/api/tasklisttype`, tlt);
  }

  public save(tlt: Partial<TaskListType>): Observable<TaskListType> {
    return this.http.put<TaskListType>(`/api/tasklisttype/${tlt.id}`, tlt);
  }

  public remove(id: number): Observable<TaskListType> {
    return this.http.delete<TaskListType>(`/api/tasklisttype/${id}`);
  }

  public updateSequence(tlt: TaskListType[]): Observable<TaskListType[]> {
    return this.http.put<TaskListType[]>(`/api/tasklisttypes`, tlt);
  }
}
