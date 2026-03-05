import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Calcs } from '@sotbi/models';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DcalcService {
  private http = inject(HttpClient);

  public state = new BehaviorSubject<Calcs | null>(null);

  public setNewState(newState: Calcs) {
    this.state.next(newState);
  }

  public getAll() {
    return this.http.get('api/bidcode/all?size=-1');
  }
}
