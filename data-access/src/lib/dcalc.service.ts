import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DcalcService {
  private http = inject(HttpClient);

  public state = new BehaviorSubject(null);

  public setNewState(newState: null) {
    this.state.next(newState);
  }

  public getAll() {
    return this.http.get('api/bidcode/all?size=-1');
  }
}
