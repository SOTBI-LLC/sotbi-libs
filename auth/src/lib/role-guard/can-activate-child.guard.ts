import type { CanActivateChildFn } from '@angular/router';
import { canActivateGuard } from './can-activate.guard';

export const canActivateChildGuard: CanActivateChildFn = (
  childRoute,
  state,
) => {
  return canActivateGuard(childRoute, state);
};
