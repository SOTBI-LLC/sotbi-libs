import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { TaskHistory, TaskList } from '@sotbi/models';
import type { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskListService {
  private http = inject(HttpClient);

  public getAll(id: number): Observable<TaskList[]> {
    return this.http.get<TaskList[]>(`/api/tasklist/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class TaskHistoryService {
  private http = inject(HttpClient);

  public getAll(id: number): Observable<TaskHistory[]> {
    return this.http.get<TaskHistory[]>(`/api/tasklist/${id}/history`);
  }

  public async addHistory(th: TaskHistory): Promise<TaskList> {
    const res = this.http.post(`/api/tasklist/${th.taskListId}/history`, th);
    return await lastValueFrom(res).then((response) => response as TaskList);
  }
}
