import type { CanDeactivateFn } from '@angular/router';
import type { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}
export const deactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component,
) => {
  return component && component.canDeactivate
    ? component.canDeactivate()
    : true;
};
