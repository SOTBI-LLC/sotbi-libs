import { Injectable } from '@angular/core';
import type { CanDeactivate } from '@angular/router';
import type { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard
  implements CanDeactivate<CanComponentDeactivate>
{
  public canDeactivate(component: CanComponentDeactivate) {
    return component && component.canDeactivate
      ? component.canDeactivate()
      : true;
  }
}
